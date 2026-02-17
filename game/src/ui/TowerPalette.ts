import Phaser from 'phaser';
import { towersData } from '@/data/validatedData';
import type { TowerType } from '@/types';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

const baseTowerIds: TowerType[] = ['agile', 'brave', 'capable', 'smart'];
const baseTowers = towersData.filter(
  (tower): tower is (typeof towersData)[number] & { id: TowerType } =>
    baseTowerIds.includes(tower.id as TowerType),
);

const PASTEL_COLORS: Record<TowerType, string> = {
  agile: '#E8D5B7',
  brave: '#D4C4A8',
  capable: '#B8D8E8',
  smart: '#FFD6A5',
};

export class TowerPalette {
  private readonly items: Phaser.GameObjects.GameObject[] = [];
  private currentSlot: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly canAfford: (cost: number) => boolean,
    private readonly onPick: (slotIndex: number, towerType: TowerType) => void,
  ) {}

  open(slotIndex: number, x: number, y: number): void {
    this.close();
    this.currentSlot = slotIndex;

    const cardWidth = 80;
    const cardHeight = 60;
    const padding = 10;
    const gap = 8;
    const panelWidth = baseTowers.length * (cardWidth + gap) - gap;

    // Directional awareness: show below if near top, otherwise above
    const showBelow = y < GAME_HEIGHT / 3;
    const panelY = showBelow ? y + 40 : y - 70;

    // Clamp to screen boundaries
    const panelX = Math.max(
      padding,
      Math.min(GAME_WIDTH - panelWidth - padding, x - panelWidth / 2),
    );

    baseTowers.forEach((tower, index) => {
      const affordable = this.canAfford(tower.cost);
      const cardX = panelX + index * (cardWidth + gap);

      // Rounded rectangle background
      const bg = this.scene.add.graphics();
      bg.fillStyle(
        affordable
          ? parseInt(PASTEL_COLORS[tower.id].replace('#', '0x'))
          : 0xcfd8dc,
        1,
      );
      bg.fillRoundedRect(cardX, panelY, cardWidth, cardHeight, 8);
      bg.setDepth(1200);
      this.items.push(bg);

      // Tower name
      const nameText = this.scene.add
        .text(cardX + cardWidth / 2, panelY + 18, tower.name, {
          color: affordable ? '#111111' : '#888888',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(1201);
      this.items.push(nameText);

      // Cost
      const costText = this.scene.add
        .text(cardX + cardWidth / 2, panelY + 40, `${tower.cost}g`, {
          color: affordable ? '#111111' : '#ff5252',
          fontFamily: 'sans-serif',
          fontSize: '12px',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(1201);
      this.items.push(costText);

      // Interactive zone
      const hitZone = this.scene.add
        .rectangle(cardX + cardWidth / 2, panelY + cardHeight / 2, cardWidth, cardHeight)
        .setDepth(1202)
        .setInteractive({ useHandCursor: affordable })
        .on('pointerdown', () => {
          if (this.currentSlot === null || !affordable) {
            return;
          }
          this.onPick(this.currentSlot, tower.id);
          this.close();
        });
      hitZone.setAlpha(0.01); // Nearly invisible but interactive
      this.items.push(hitZone);
    });
  }

  close(): void {
    this.currentSlot = null;
    this.items.forEach((item) => item.destroy());
    this.items.length = 0;
  }

  contains(gameObject: Phaser.GameObjects.GameObject): boolean {
    return this.items.includes(gameObject);
  }

  destroy(): void {
    this.close();
  }
}
