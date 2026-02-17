import Phaser from 'phaser';
import type { SoldierSystem } from '@/systems/SoldierSystem';
import { assetManager } from '@/assets/AssetManager';
import { getSpriteSheetKey, getAnimationKey } from '@/assets/AssetDescriptor';

interface SoldierVisual {
  sprite: Phaser.GameObjects.Sprite;
  currentAnim: string;
}

export class SoldierRenderer {
  private readonly visuals = new Map<string, SoldierVisual>();
  private animationsCreated = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly soldierSystem: SoldierSystem,
  ) {}

  sync(): void {
    this.ensureAnimations();

    const nextKeys = new Set<string>();

    for (const slotIndex of this.soldierSystem.getManagedSlotIndices()) {
      const squad = this.soldierSystem.getSquad(slotIndex);
      squad?.getSoldiers().forEach((soldier, index) => {
        const key = `${slotIndex}:${index}`;
        nextKeys.add(key);

        let visual = this.visuals.get(key);
        if (!visual) {
          visual = this.create(key, soldier.type);
        }

        visual.sprite.setPosition(soldier.position.x, soldier.position.y);
        visual.sprite.setDepth(soldier.position.y + 2);

        // Switch animation based on status
        const targetState = soldier.status === 'engaging' ? 'attack' : 'walk';
        const targetAnim = getAnimationKey('soldier', soldier.type, targetState);

        if (visual.currentAnim !== targetAnim) {
          if (this.scene.anims.exists(targetAnim)) {
            visual.sprite.play(targetAnim, true);
          }
          visual.currentAnim = targetAnim;
        }

        // Dim dead soldiers
        visual.sprite.setAlpha(soldier.status === 'dead' ? 0.3 : 1);
      });
    }

    [...this.visuals.keys()]
      .filter((key) => !nextKeys.has(key))
      .forEach((key) => {
        this.visuals.get(key)?.sprite.destroy();
        this.visuals.delete(key);
      });
  }

  destroy(): void {
    this.visuals.forEach((visual) => visual.sprite.destroy());
    this.visuals.clear();
  }

  private create(key: string, soldierType: 'brave' | 'knight' | 'barbarian'): SoldierVisual {
    const sheetKey = getSpriteSheetKey('soldier', soldierType, 'walk');
    const sprite = this.scene.add.sprite(0, 0, sheetKey);

    const animKey = getAnimationKey('soldier', soldierType, 'walk');
    if (this.scene.anims.exists(animKey)) {
      sprite.play(animKey, true);
    }

    const visual: SoldierVisual = { sprite, currentAnim: animKey };
    this.visuals.set(key, visual);
    return visual;
  }

  private ensureAnimations(): void {
    if (!this.animationsCreated) {
      assetManager.createAnimations(this.scene);
      this.animationsCreated = true;
    }
  }
}
