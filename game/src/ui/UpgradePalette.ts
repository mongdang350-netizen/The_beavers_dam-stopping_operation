import Phaser from 'phaser';
import type { Tower } from '@/entities/Tower';
import type { UpgradeType } from '@/types';
import { GAME_HEIGHT } from '@/utils/constants';

const FAMILY_COLORS: Record<string, string> = {
  agile: '#E8D5B7',
  brave: '#D4C4A8',
  barbarian: '#FFB4A9',
  capable: '#B8D8E8',
  smart: '#FFD6A5',
};

export class UpgradePalette {
  private readonly items: Phaser.GameObjects.GameObject[] = [];

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

    const cardWidth = 80;
    const cardHeight = 60;

    // Directional awareness
    const showBelow = y < GAME_HEIGHT / 3;
    const baseY = showBelow ? y + 40 : y - 120;

    // Title (tower info)
    const titleBg = this.scene.add.graphics();
    titleBg.fillStyle(0x263238, 1);
    titleBg.fillRoundedRect(x - 80, baseY, 160, 36, 6);
    titleBg.setDepth(1200);
    this.items.push(titleBg);

    const titleText = this.scene.add
      .text(
        x,
        baseY + 18,
        `${tower.config.name}\nATK ${tower.config.atk} / AS ${tower.config.attackSpeed}`,
        {
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: '12px',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setDepth(1201);
    this.items.push(titleText);

    // Upgrade buttons with branching support
    const upgradeY = baseY + 50;
    if (upgrades.length === 2) {
      // Side-by-side with separator
      upgrades.forEach((upgradeType, index) => {
        const cost = getCost(upgradeType);
        const affordable = canAfford(cost);
        const cardX = x + (index === 0 ? -cardWidth - 4 : 4);

        this.createUpgradeCard(
          cardX,
          upgradeY,
          cardWidth,
          cardHeight,
          upgradeType,
          cost,
          affordable,
          tower,
          () => {
            if (!affordable) return;
            onUpgrade(upgradeType);
            this.close();
          },
        );
      });

      // "VS" separator
      const separator = this.scene.add
        .text(x, upgradeY + cardHeight / 2, '/', {
          color: '#888888',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(1201);
      this.items.push(separator);
    } else if (upgrades.length === 1) {
      // Single centered upgrade
      const upgradeType = upgrades[0];
      const cost = getCost(upgradeType);
      const affordable = canAfford(cost);

      this.createUpgradeCard(
        x - cardWidth / 2,
        upgradeY,
        cardWidth,
        cardHeight,
        upgradeType,
        cost,
        affordable,
        tower,
        () => {
          if (!affordable) return;
          onUpgrade(upgradeType);
          this.close();
        },
      );
    }

    // Sell button (pastel soft red)
    const sellY = upgradeY + cardHeight + 12;
    const sellBg = this.scene.add.graphics();
    sellBg.fillStyle(0xffcdd2, 1);
    sellBg.fillRoundedRect(x - 60, sellY, 120, 32, 6);
    sellBg.setDepth(1200);
    this.items.push(sellBg);

    const sellText = this.scene.add
      .text(x, sellY + 16, `판매 +${Math.floor(tower.totalCost * 0.5)}g`, {
        color: '#111111',
        fontFamily: 'sans-serif',
        fontSize: '13px',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1201);
    this.items.push(sellText);

    const sellHitZone = this.scene.add
      .rectangle(x, sellY + 16, 120, 32)
      .setDepth(1202)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        onSell();
        this.close();
      });
    sellHitZone.setAlpha(0.01);
    this.items.push(sellHitZone);
  }

  private createUpgradeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    upgradeType: UpgradeType,
    cost: number,
    affordable: boolean,
    tower: Tower,
    onClick: () => void,
  ): void {
    // Get family color from tower's base type
    const towerFamily = tower.config.id.split('_')[0];
    const bgColor = FAMILY_COLORS[towerFamily] || '#c8e6c9';

    const bg = this.scene.add.graphics();
    bg.fillStyle(affordable ? parseInt(bgColor.replace('#', '0x')) : 0xeceff1, 1);
    bg.fillRoundedRect(x, y, width, height, 8);
    bg.setDepth(1200);
    this.items.push(bg);

    const nameText = this.scene.add
      .text(x + width / 2, y + 20, upgradeType, {
        color: affordable ? '#111111' : '#888888',
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1201);
    this.items.push(nameText);

    const costText = this.scene.add
      .text(x + width / 2, y + 40, `${cost}g`, {
        color: affordable ? '#111111' : '#ff5252',
        fontFamily: 'sans-serif',
        fontSize: '11px',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1201);
    this.items.push(costText);

    const hitZone = this.scene.add
      .rectangle(x + width / 2, y + height / 2, width, height)
      .setDepth(1202)
      .setInteractive({ useHandCursor: affordable })
      .on('pointerdown', onClick);
    hitZone.setAlpha(0.01);
    this.items.push(hitZone);
  }

  close(): void {
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
