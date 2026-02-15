import Phaser from 'phaser';
import { towersData } from '@/data/validatedData';
import type { TowerType } from '@/types';

const baseTowerIds: TowerType[] = ['archer', 'warrior', 'mage', 'bomb'];
const baseTowers = towersData.filter(
  (tower): tower is (typeof towersData)[number] & { id: TowerType } =>
    baseTowerIds.includes(tower.id as TowerType),
);

export class TowerPalette {
  private readonly items: Phaser.GameObjects.Text[] = [];
  private currentSlot: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly canAfford: (cost: number) => boolean,
    private readonly onPick: (slotIndex: number, towerType: TowerType) => void,
  ) {}

  open(slotIndex: number, x: number, y: number): void {
    this.close();
    this.currentSlot = slotIndex;

    baseTowers.forEach((tower, index) => {
      const affordable = this.canAfford(tower.cost);
      const button = this.scene.add
        .text(x + index * 88 - 132, y - 70, `${tower.name}\n${tower.cost}g`, {
          color: affordable ? '#111111' : '#ff5252',
          backgroundColor: affordable ? '#dcedc8' : '#cfd8dc',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          align: 'center',
          padding: { x: 6, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(1200)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.currentSlot === null || !affordable) {
            return;
          }
          this.onPick(this.currentSlot, tower.id);
          this.close();
        });
      this.items.push(button);
    });
  }

  close(): void {
    this.currentSlot = null;
    this.items.forEach((item) => item.destroy());
    this.items.length = 0;
  }

  contains(gameObject: Phaser.GameObjects.GameObject): boolean {
    return this.items.includes(gameObject as Phaser.GameObjects.Text);
  }

  destroy(): void {
    this.close();
  }
}
