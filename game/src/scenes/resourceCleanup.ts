export class ResourceCleanup {
  private disposers: Array<() => void> = [];

  track(disposer: () => void): void {
    this.disposers.push(disposer);
  }

  disposeAll(): void {
    const items = this.disposers;
    this.disposers = [];
    items.forEach((disposer) => disposer());
  }
}
