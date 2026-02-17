import Phaser from 'phaser';
import type { Tower } from '@/entities/Tower';
import type { TowerSlot } from '@/types';
import { visualPolicy } from '@/renderers/visualPolicy';
import { AnimatedRenderer, type SpriteVisual } from '@/renderers/AnimatedRenderer';
import { getSpriteSheetKey, getAnimationKey } from '@/assets/AssetDescriptor';

interface SlotVisual {
  box: Phaser.GameObjects.Rectangle;
  plusLabel: Phaser.GameObjects.Text;
}

export class TowerRenderer extends AnimatedRenderer<number, Tower> {
  private readonly slotVisuals = new Map<number, SlotVisual>();
  private currentAnims = new Map<number, string>();

  renderSlots(slots: TowerSlot[], onClick: (slotId: number) => void): void {
    slots.forEach((slot) => {
      const box = this.scene.add
        .rectangle(slot.x, slot.y, 56, 56, visualPolicy.slotFillColor, 0.35)
        .setStrokeStyle(2, visualPolicy.slotBorderColor)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => onClick(slot.id))
        .setDepth(10);

      const plusLabel = this.scene.add
        .text(slot.x, slot.y, '+', {
          color: '#dceffd',
          fontFamily: 'sans-serif',
          fontSize: '28px',
        })
        .setOrigin(0.5)
        .setDepth(10);

      this.slotVisuals.set(slot.id, { box, plusLabel });
    });
  }

  sync(towers: Tower[]): void {
    const activeSlots = new Set(towers.map((t) => t.slotIndex));

    towers.forEach((tower) => {
      const slotIndex = tower.slotIndex;
      // Hide slot "+" when tower is placed
      const slotVisual = this.slotVisuals.get(slotIndex);
      if (slotVisual) {
        slotVisual.plusLabel.setVisible(false);
      }

      const existing = this.visuals.get(slotIndex);
      if (existing) {
        this.updateVisual(existing, tower);
        return;
      }

      const visual = this.createVisual(tower);
      this.visuals.set(slotIndex, visual);
    });

    // Show "+" for empty slots
    this.slotVisuals.forEach((slotVisual, slotId) => {
      slotVisual.plusLabel.setVisible(!activeSlots.has(slotId));
    });

    // Remove visuals for sold towers
    [...this.visuals.keys()]
      .filter((slotIndex) => !activeSlots.has(slotIndex))
      .forEach((slotIndex) => {
        const visual = this.visuals.get(slotIndex)!;
        this.destroyVisual(visual);
        this.visuals.delete(slotIndex);
        this.currentAnims.delete(slotIndex);
      });
  }

  protected getKey(tower: Tower): number {
    return tower.slotIndex;
  }

  protected createVisual(tower: Tower): SpriteVisual {
    this.ensureSpriteSheetsCreated();

    const towerId = this.resolveTowerId(tower.config.id);
    const sheetKey = getSpriteSheetKey('tower', towerId, 'idle');
    const visual = this.createSpriteVisual(
      tower.position.x,
      tower.position.y,
      sheetKey,
      30,
    );

    // Scale tower sprite for better visibility
    visual.sprite.setScale(1.5);

    // Play idle animation
    const animKey = getAnimationKey('tower', towerId, 'idle');
    this.playAnimation(visual.sprite, animKey);
    this.currentAnims.set(tower.slotIndex, animKey);

    return visual;
  }

  protected updateVisual(visual: SpriteVisual, tower: Tower): void {
    visual.container.setPosition(tower.position.x, tower.position.y);

    const towerId = this.resolveTowerId(tower.config.id);
    const targetState = tower.attackPhase === 'firing' ? 'attack' : 'idle';
    const targetAnimKey = getAnimationKey('tower', towerId, targetState);

    const currentAnim = this.currentAnims.get(tower.slotIndex);
    if (currentAnim !== targetAnimKey) {
      // Switch sprite texture to the correct sheet
      const sheetKey = getSpriteSheetKey('tower', towerId, targetState);
      if (this.scene.textures.exists(sheetKey)) {
        visual.sprite.setTexture(sheetKey);
      }
      this.playAnimation(visual.sprite, targetAnimKey);
      this.currentAnims.set(tower.slotIndex, targetAnimKey);
    }
  }

  destroy(): void {
    this.slotVisuals.forEach(({ box, plusLabel }) => {
      box.destroy();
      plusLabel.destroy();
    });
    this.slotVisuals.clear();
    this.currentAnims.clear();
    super.destroy();
  }

  /**
   * Resolve tower config id to the base tower type used for pixel art lookup.
   * Upgrade types (archer, knight, etc.) are used directly since towerPixelArt
   * has entries for all 12 tower types including upgrades.
   */
  private resolveTowerId(configId: string): string {
    return configId;
  }
}
