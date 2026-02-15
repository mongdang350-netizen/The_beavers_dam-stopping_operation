import Phaser from 'phaser';
import type { Projectile } from '@/entities/Projectile';

export class ProjectileRenderer {
  private readonly visuals = new Map<Projectile, Phaser.GameObjects.Arc>();

  constructor(private readonly scene: Phaser.Scene) {}

  sync(projectiles: Projectile[]): void {
    const active = new Set(projectiles);

    projectiles.forEach((projectile) => {
      const visual = this.visuals.get(projectile) ?? this.create(projectile);
      visual.setPosition(projectile.position.x, projectile.position.y);
    });

    [...this.visuals.keys()]
      .filter((projectile) => !active.has(projectile))
      .forEach((projectile) => {
        const visual = this.visuals.get(projectile);
        visual?.destroy();
        this.visuals.delete(projectile);
      });
  }

  destroy(): void {
    this.visuals.forEach((visual) => visual.destroy());
    this.visuals.clear();
  }

  private create(projectile: Projectile): Phaser.GameObjects.Arc {
    const visual = this.scene.add.circle(projectile.position.x, projectile.position.y, 4, 0xffe082);
    this.visuals.set(projectile, visual);
    return visual;
  }
}
