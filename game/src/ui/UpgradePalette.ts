import Phaser from 'phaser';
import type { Tower } from '@/entities/Tower';
import type { UpgradeType } from '@/types';

export class UpgradePalette {
  private readonly items: Phaser.GameObjects.Text[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  open(
    x: number,
    y: number,
    tower: Tower,
    upgrades: UpgradeType[],
    canAfford: (cost: number) => boolean,
    getCost: (upgradeType: UpgradeType) => number,
    onUpgrade: (upgradeType: UpgradeType) => void,
    onSell: () => void,
  ): void {
    this.close();

    const title = this.scene.add
      .text(x, y - 80, `${tower.config.name}\nATK ${tower.config.atk} / AS ${tower.config.attackSpeed}`, {
        color: '#ffffff',
        backgroundColor: '#263238',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        align: 'center',
        padding: { x: 8, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(1200);
    this.items.push(title);

    upgrades.forEach((upgradeType, index) => {
      const cost = getCost(upgradeType);
      const affordable = canAfford(cost);
      const button = this.scene.add
        .text(x + (index === 0 ? -80 : 80), y - 25, `${upgradeType}\n${cost}g`, {
          color: affordable ? '#111111' : '#ff5252',
          backgroundColor: affordable ? '#c8e6c9' : '#eceff1',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          align: 'center',
          padding: { x: 7, y: 5 },
        })
        .setOrigin(0.5)
        .setDepth(1200)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (!affordable) {
            return;
          }
          onUpgrade(upgradeType);
          this.close();
        });
      this.items.push(button);
    });

    const sell = this.scene.add
      .text(x, y + 30, `판매 +${Math.floor(tower.totalCost * 0.5)}g`, {
        color: '#111111',
        backgroundColor: '#ffe082',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        padding: { x: 8, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(1200)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        onSell();
        this.close();
      });
    this.items.push(sell);
  }

  close(): void {
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
