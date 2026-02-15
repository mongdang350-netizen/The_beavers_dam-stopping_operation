type Listener<T> = (payload: T) => void;

export class EventBus<TEvents extends object> {
  private listeners = new Map<keyof TEvents, Set<Listener<unknown>>>();

  on<TKey extends keyof TEvents>(event: TKey, listener: Listener<TEvents[TKey]>): () => void {
    const current = this.listeners.get(event) ?? new Set<Listener<unknown>>();
    current.add(listener as Listener<unknown>);
    this.listeners.set(event, current);

    return () => {
      this.off(event, listener);
    };
  }

  once<TKey extends keyof TEvents>(event: TKey, listener: Listener<TEvents[TKey]>): () => void {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe();
      listener(payload);
    });

    return unsubscribe;
  }

  off<TKey extends keyof TEvents>(event: TKey, listener: Listener<TEvents[TKey]>): void {
    const current = this.listeners.get(event);
    if (!current) {
      return;
    }

    current.delete(listener as Listener<unknown>);
    if (current.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void {
    const current = this.listeners.get(event);
    if (!current) {
      return;
    }

    [...current].forEach((listener) => {
      listener(payload);
    });
  }
}
