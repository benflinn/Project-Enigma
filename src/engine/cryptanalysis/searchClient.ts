import {
  CandidateResult,
  executeBoundedSearch,
  SearchBounds,
  SearchProgress,
  sortCandidates,
  ScoreHistoryPoint,
} from './searchEngine';
import { WorkerInMessage, WorkerOutMessage } from './searchWorker';

export interface SearchClientCallbacks {
  onProgress?: (progress: SearchProgress) => void;
  onCompleted?: (candidates: CandidateResult[], progress: SearchProgress) => void;
  onCancelled?: (progress: SearchProgress) => void;
  onError?: (error: string) => void;
}

export interface SearchClientOptions {
  maxWorkers?: number;
}

/**
 * Partitions search bounds into independent chunks for parallel execution across a worker pool.
 */
export function partitionSearchBounds(bounds: SearchBounds, numPartitions: number): SearchBounds[] {
  if (numPartitions <= 1) return [{ ...bounds }];

  const strategy = bounds.strategy ?? 'EXHAUSTIVE';

  if (strategy === 'HILL_CLIMBING') {
    // Partition restarts across workers
    const totalRestarts = bounds.hillClimbing?.maxRestarts ?? 8;
    const restartsPerWorker = Math.max(1, Math.ceil(totalRestarts / numPartitions));
    const partitions: SearchBounds[] = [];

    for (let i = 0; i < numPartitions; i++) {
      const baseSeed = (bounds.hillClimbing?.randomSeed ?? 42) + i * 1000;
      partitions.push({
        ...bounds,
        hillClimbing: {
          maxRestarts: restartsPerWorker,
          maxIterationsPerRestart: bounds.hillClimbing?.maxIterationsPerRestart ?? 100,
          maxSteckerPairs: bounds.hillClimbing?.maxSteckerPairs ?? 6,
          fixedPlugboardPairs: bounds.hillClimbing?.fixedPlugboardPairs ?? bounds.plugboard,
          randomSeed: baseSeed,
        },
      });
    }
    return partitions;
  }

  // Partition rotor orders or position spaces
  if (bounds.rotorOrders.length >= numPartitions) {
    const partitions: SearchBounds[] = [];
    const chunkSize = Math.ceil(bounds.rotorOrders.length / numPartitions);
    for (let i = 0; i < bounds.rotorOrders.length; i += chunkSize) {
      partitions.push({
        ...bounds,
        rotorOrders: bounds.rotorOrders.slice(i, i + chunkSize),
      });
    }
    return partitions;
  }

  if (bounds.positions.left.length >= numPartitions) {
    const partitions: SearchBounds[] = [];
    const chunkSize = Math.ceil(bounds.positions.left.length / numPartitions);
    for (let i = 0; i < bounds.positions.left.length; i += chunkSize) {
      partitions.push({
        ...bounds,
        positions: {
          ...bounds.positions,
          left: bounds.positions.left.slice(i, i + chunkSize),
        },
      });
    }
    return partitions;
  }

  if (bounds.positions.middle.length >= numPartitions) {
    const partitions: SearchBounds[] = [];
    const chunkSize = Math.ceil(bounds.positions.middle.length / numPartitions);
    for (let i = 0; i < bounds.positions.middle.length; i += chunkSize) {
      partitions.push({
        ...bounds,
        positions: {
          ...bounds.positions,
          middle: bounds.positions.middle.slice(i, i + chunkSize),
        },
      });
    }
    return partitions;
  }

  return [{ ...bounds }];
}

export class SearchClient {
  private workers: Worker[] = [];
  private maxWorkers: number;
  private currentSessionId: string | null = null;
  private isSynchronousFallback = false;
  private syncCancelFlag = false;

  constructor(options: SearchClientOptions = {}) {
    const defaultWorkers = typeof navigator !== 'undefined' ? Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 2) - 1)) : 2;
    this.maxWorkers = options.maxWorkers ?? defaultWorkers;
    this.initWorkers();
  }

  public setConcurrency(concurrency: number): void {
    const target = Math.min(4, Math.max(1, concurrency));
    if (this.maxWorkers !== target) {
      this.maxWorkers = target;
      this.terminate();
      this.initWorkers();
    }
  }

  public getConcurrency(): number {
    return this.maxWorkers;
  }

  private initWorkers(): void {
    if (typeof Worker !== 'undefined' && typeof window !== 'undefined') {
      try {
        this.workers = [];
        for (let i = 0; i < this.maxWorkers; i++) {
          const w = new Worker(
            new URL('./searchWorker.ts', import.meta.url),
            { type: 'module' }
          );
          this.workers.push(w);
        }
        this.isSynchronousFallback = false;
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

    if (this.workers.length > 0 && !this.isSynchronousFallback) {
      const partitions = partitionSearchBounds(bounds, this.workers.length);
      const activeWorkerCount = partitions.length;
      const workerProgresses: Record<number, SearchProgress> = {};
      let aggregatedCandidates: CandidateResult[] = [];
      let completedWorkerCount = 0;
      let errorEncountered = false;
      const startTime = performance.now();
      const scoreHistory: ScoreHistoryPoint[] = [];

      const handleProgressAggregation = () => {
        let totalEvaluated = 0;
        let totalExpected = 0;
        let bestScore = -Infinity;
        let bestCand: CandidateResult | null = null;

        for (let i = 0; i < activeWorkerCount; i++) {
          const wp = workerProgresses[i];
          if (wp) {
            totalEvaluated += wp.evaluatedCount;
            totalExpected += wp.totalCount;
            if (wp.currentBestCandidate && wp.currentBestScore > bestScore) {
              bestScore = wp.currentBestScore;
              bestCand = wp.currentBestCandidate;
            }
          }
        }

        const elapsedMs = Math.max(1, performance.now() - startTime);
        const percent = totalExpected > 0 ? (totalEvaluated / totalExpected) * 100 : 0;
        const aggregatedProgress: SearchProgress = {
          sessionId,
          strategy: bounds.strategy ?? 'EXHAUSTIVE',
          evaluatedCount: totalEvaluated,
          totalCount: totalExpected,
          percentComplete: Math.min(100, percent),
          elapsedMs,
          configsPerSecond: Math.round((totalEvaluated / elapsedMs) * 1000),
          currentBestScore: bestScore,
          currentBestCandidate: bestCand,
          scoreHistory: [...scoreHistory],
          status: completedWorkerCount === activeWorkerCount ? 'COMPLETED' : 'RUNNING',
        };

        callbacks.onProgress?.(aggregatedProgress);
        return aggregatedProgress;
      };

      for (let i = 0; i < activeWorkerCount; i++) {
        const worker = this.workers[i];
        const subSessionId = `${sessionId}-w${i}`;
        const subBounds = partitions[i];

        worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
          const msg = event.data;
          if (!msg.payload.sessionId.startsWith(sessionId)) return;

          switch (msg.type) {
            case 'PROGRESS': {
              workerProgresses[i] = msg.payload;
              if (msg.payload.currentBestCandidate && msg.payload.currentBestScore > (scoreHistory[scoreHistory.length - 1]?.bestScore ?? -Infinity)) {
                scoreHistory.push({
                  evaluations: msg.payload.evaluatedCount,
                  bestScore: msg.payload.currentBestScore,
                  timestamp: Math.round(performance.now() - startTime),
                });
              }
              handleProgressAggregation();
              break;
            }
            case 'COMPLETED': {
              workerProgresses[i] = msg.payload.progress;
              aggregatedCandidates = [...aggregatedCandidates, ...msg.payload.candidates];
              completedWorkerCount++;

              if (completedWorkerCount === activeWorkerCount && !errorEncountered) {
                const finalProgress = handleProgressAggregation();
                finalProgress.status = 'COMPLETED';
                const sorted = sortCandidates(aggregatedCandidates, bounds.maxCandidates ?? 20, bounds.scoringMethod);
                callbacks.onCompleted?.(sorted, finalProgress);
              }
              break;
            }
            case 'CANCELLED': {
              const cancelProgress = handleProgressAggregation();
              cancelProgress.status = 'CANCELLED';
              callbacks.onCancelled?.(cancelProgress);
              break;
            }
            case 'ERROR': {
              errorEncountered = true;
              callbacks.onError?.(msg.payload.error);
              break;
            }
          }
        };

        worker.onerror = (err) => {
          errorEncountered = true;
          callbacks.onError?.(err.message || 'Worker runtime error');
        };

        const startMsg: WorkerInMessage = {
          type: 'START_SEARCH',
          payload: {
            sessionId: subSessionId,
            bounds: subBounds,
            ciphertext,
          },
        };

        worker.postMessage(startMsg);
      }
    } else {
      // Fallback for non-worker environments (e.g. node, jsdom)
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

    if (this.workers.length > 0 && !this.isSynchronousFallback) {
      for (let i = 0; i < this.workers.length; i++) {
        const cancelMsg: WorkerInMessage = {
          type: 'CANCEL_SEARCH',
          payload: {
            sessionId: `${targetSession}-w${i}`,
          },
        };
        this.workers[i].postMessage(cancelMsg);
      }
    }
  }

  public terminate(): void {
    for (const w of this.workers) {
      w.terminate();
    }
    this.workers = [];
    this.currentSessionId = null;
  }
}
