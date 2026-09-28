import {
  executeBoundedSearch,
  SearchBounds,
  SearchProgress,
} from './searchEngine';

export type WorkerInMessage =
  | {
      type: 'START_SEARCH';
      payload: {
        sessionId: string;
        bounds: SearchBounds;
        ciphertext: string;
      };
    }
  | {
      type: 'CANCEL_SEARCH';
      payload: {
        sessionId: string;
      };
    };

export type WorkerOutMessage =
  | {
      type: 'PROGRESS';
      payload: SearchProgress;
    }
  | {
      type: 'COMPLETED';
      payload: {
        sessionId: string;
        candidates: any[];
        progress: SearchProgress;
      };
    }
  | {
      type: 'CANCELLED';
      payload: {
        sessionId: string;
        progress: SearchProgress;
      };
    }
  | {
      type: 'ERROR';
      payload: {
        sessionId: string;
        error: string;
      };
    };

let activeSessionId: string | null = null;
let isCancelledFlag = false;

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const message = event.data;

  if (message.type === 'CANCEL_SEARCH') {
    if (activeSessionId === message.payload.sessionId) {
      isCancelledFlag = true;
    }
    return;
  }

  if (message.type === 'START_SEARCH') {
    const { sessionId, bounds, ciphertext } = message.payload;
    activeSessionId = sessionId;
    isCancelledFlag = false;

    try {
      const result = await executeBoundedSearch({
        sessionId,
        bounds,
        ciphertext,
        isCancelled: () => isCancelledFlag || activeSessionId !== sessionId,
        onProgress: (progress) => {
          if (activeSessionId === sessionId) {
            self.postMessage({
              type: 'PROGRESS',
              payload: progress,
            });
          }
        },
      });

      if (isCancelledFlag || activeSessionId !== sessionId) {
        self.postMessage({
          type: 'CANCELLED',
          payload: {
            sessionId,
            progress: result.progress,
          },
        });
      } else {
        self.postMessage({
          type: 'COMPLETED',
          payload: {
            sessionId,
            candidates: result.candidates,
            progress: result.progress,
          },
        });
      }
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        payload: {
          sessionId,
          error: err?.message || 'Unknown search worker error',
        },
      });
    } finally {
      if (activeSessionId === sessionId) {
        activeSessionId = null;
      }
    }
  }
};
