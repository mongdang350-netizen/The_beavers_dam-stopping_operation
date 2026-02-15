export class ObjectPool<T> {
  private readonly pool: T[] = [];

  constructor(
    private readonly create: () => T,
    private readonly reset?: (obj: T) => void,
  ) {}

  acquire(): T {
    return this.pool.pop() ?? this.create();
  }

  release(obj: T): void {
    if (this.reset) {
      this.reset(obj);
    } else if (typeof obj === 'object' && obj !== null && 'reset' in obj) {
      const candidate = obj as { reset?: () => void };
      candidate.reset?.();
    }
    this.pool.push(obj);
  }

  clear(): void {
    this.pool.length = 0;
  }

  size(): number {
    return this.pool.length;
  }
}

