import {
  CandidateResult,
  executeBoundedSearch,
  SearchBounds,
  SearchProgress,
} from './searchEngine';
import { WorkerInMessage, WorkerOutMessage } from './searchWorker';

export interface SearchClientCallbacks {
  onProgress?: (progress: SearchProgress) => void;
  onCompleted?: (candidates: CandidateResult[], progress: SearchProgress) => void;
  onCancelled?: (progress: SearchProgress) => void;
  onError?: (error: string) => void;
}

export class SearchClient {
  private worker: Worker | null = null;
  private currentSessionId: string | null = null;
  private isSynchronousFallback = false;
  private syncCancelFlag = false;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined' && typeof window !== 'undefined') {
      try {
        this.worker = new Worker(
          new URL('./searchWorker.ts', import.meta.url),
          { type: 'module' }
        );
      } catch {
        this.isSynchronousFallback = true;
      }
    } else {
      this.isSynchronousFallback = true;
    }
  }

  public startSearch(
    bounds: SearchBounds,
    ciphertext: string,
    callbacks: SearchClientCallbacks
  ): string {
    const sessionId = `search-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.currentSessionId = sessionId;
    this.syncCancelFlag = false;

    if (this.worker && !this.isSynchronousFallback) {
      this.worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
        const msg = event.data;
        if (msg.payload.sessionId !== this.currentSessionId) {
          // Ignore stale responses from previous/cancelled searches
          return;
        }

        switch (msg.type) {
          case 'PROGRESS':
            callbacks.onProgress?.(msg.payload);
            break;
          case 'COMPLETED':
            callbacks.onCompleted?.(msg.payload.candidates, msg.payload.progress);
            break;
          case 'CANCELLED':
            callbacks.onCancelled?.(msg.payload.progress);
            break;
          case 'ERROR':
            callbacks.onError?.(msg.payload.error);
            break;
        }
      };

      this.worker.onerror = (err) => {
        callbacks.onError?.(err.message || 'Worker runtime error');
      };

      const startMsg: WorkerInMessage = {
        type: 'START_SEARCH',
        payload: {
          sessionId,
          bounds,
          ciphertext,
        },
      };

      this.worker.postMessage(startMsg);
    } else {
      // Fallback for non-worker environments (e.g., node, jsdom)
      executeBoundedSearch({
        sessionId,
        bounds,
        ciphertext,
        isCancelled: () => this.syncCancelFlag || this.currentSessionId !== sessionId,
        onProgress: (progress) => {
          if (this.currentSessionId === sessionId) {
            callbacks.onProgress?.(progress);
          }
        },
      })
        .then(({ candidates, progress }) => {
          if (this.currentSessionId === sessionId) {
            if (this.syncCancelFlag || progress.status === 'CANCELLED') {
              callbacks.onCancelled?.(progress);
            } else {
              callbacks.onCompleted?.(candidates, progress);
            }
          }
        })
        .catch((err: any) => {
          if (this.currentSessionId === sessionId) {
            callbacks.onError?.(err?.message || 'Search error');
          }
        });
    }

    return sessionId;
  }

  public cancelSearch(sessionId?: string): void {
    const targetSession = sessionId || this.currentSessionId;
    if (!targetSession) return;

    this.syncCancelFlag = true;

    if (this.worker && !this.isSynchronousFallback) {
      const cancelMsg: WorkerInMessage = {
        type: 'CANCEL_SEARCH',
        payload: {
          sessionId: targetSession,
        },
      };
      this.worker.postMessage(cancelMsg);
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.currentSessionId = null;
  }
}
