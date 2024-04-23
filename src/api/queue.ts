/**
 * Task Runner
 * Breaks bulk execution in small chunks.
 *
 * @param maxLen - Maximum number of tasks
 * @param waitLine - Waits before retrying adding to queue
 * @param leaveTime - Waits before freeing the queue
 */
export class TaskRunner {
  /**
   * Counters
   */
  todo: number = 0;
  done: number = 0;

  /**
   * Queue logic params
   */
  // the current task pool
  count: number = 0;
  // max tasks
  maxLen: number = 8;

  /**
   * Controls queue deferring to avoid choking the thread
   * Both reduce performance considerable but may improve stability
   */
  // ms to wait retry, null will easily produce: Max call stack exceded
  waitLine: number | null = 0;
  // ms to leave queue
  leaveTime: number | null = null;

  constructor(opts?: {
    maxLen?: number;
    waitLine?: number;
    leaveTime?: number;
  }) {
    this.done = 0;
    this.count = 0;
    if (opts?.maxLen) this.maxLen = opts.maxLen;
    if (opts?.waitLine) this.waitLine = opts.waitLine;
    if (opts?.leaveTime) this.leaveTime = opts.leaveTime;
  }

  add = (task: Function) => {
    this.todo++;
    this.enqueue(task);
  };

  enqueue = (task: Function) => {
    let sent = false;

    if (this.count < this.maxLen) {
      sent = true;
      this.count++;
      this.done++;
      task(this.count).then((resp: string) => {
        // DEBUG: task response
        // console.log("Task: " + resp);

        if (this.leaveTime != null) {
          setTimeout(() => this.count--, this.leaveTime);
        } else {
          this.count--;
        }
      });
    }

    if (this.waitLine != null) {
      if (!sent) setTimeout(() => this.enqueue(task), this.waitLine);
    } else {
      if (!sent) this.enqueue(task);
    }
  };
}
