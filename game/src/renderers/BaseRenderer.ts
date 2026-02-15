import Phaser from 'phaser';

export abstract class BaseRenderer<TKey, TVisual, TEntity> {
  protected readonly visuals = new Map<TKey, TVisual>();

  constructor(protected readonly scene: Phaser.Scene) {}

  sync(entities: TEntity[]): void {
    const activeKeys = new Set<TKey>();

    entities.forEach((entity) => {
      const key = this.getKey(entity);
      activeKeys.add(key);
      const visual = this.visuals.get(key) ?? this.createAndStore(key, entity);
      this.updateVisual(visual, entity);
    });

    [...this.visuals.keys()]
      .filter((key) => !activeKeys.has(key))
      .forEach((key) => {
        const visual = this.visuals.get(key)!;
        this.destroyVisual(visual);
        this.visuals.delete(key);
      });
  }

  destroy(): void {
    this.visuals.forEach((visual) => this.destroyVisual(visual));
    this.visuals.clear();
  }

  protected abstract getKey(entity: TEntity): TKey;
  protected abstract createVisual(entity: TEntity): TVisual;
  protected abstract updateVisual(visual: TVisual, entity: TEntity): void;
  protected abstract destroyVisual(visual: TVisual): void;

  private createAndStore(key: TKey, entity: TEntity): TVisual {
    const visual = this.createVisual(entity);
    this.visuals.set(key, visual);
    return visual;
  }
}
