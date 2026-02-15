import { towersData } from '@/data/validatedData';
import { Tower } from '@/entities/Tower';
import type { PathSystem } from '@/systems/PathSystem';
import type { TowerConfig, TowerType, UpgradeType } from '@/types';

const towerById = new Map(towersData.map((tower) => [tower.id, tower]));

const upgradeTree: Record<TowerType, UpgradeType[]> = {
  archer: ['blowgunner', 'crossbowman'],
  warrior: ['knight', 'suit'],
  mage: ['fireMage', 'iceMage'],
  bomb: ['logRoller', 'mortar'],
};

const baseTowerTypeByUpgrade: Record<UpgradeType, TowerType> = {
  blowgunner: 'archer',
  crossbowman: 'archer',
  knight: 'warrior',
  suit: 'warrior',
  fireMage: 'mage',
  iceMage: 'mage',
  logRoller: 'bomb',
  mortar: 'bomb',
};

export class TowerFactory {
  createTower(type: TowerType, slotIndex: number, pathSystem: PathSystem): Tower {
    const config = this.getTowerConfig(type);
    const slot = pathSystem.getTowerSlots().find((item) => item.id === slotIndex);
    if (!slot) {
      throw new Error(`Unknown slot index: ${slotIndex}`);
    }
    return new Tower(config, slot, slotIndex);
  }

  upgradeTower(tower: Tower, upgradeType: UpgradeType): Tower {
    const baseType = this.getBaseType(tower.config.id);
    const allowed = upgradeTree[baseType];
    if (!allowed.includes(upgradeType)) {
      throw new Error(`Upgrade ${upgradeType} is not allowed for tower ${tower.config.id}`);
    }

    const upgradeConfig = this.getTowerConfig(upgradeType);
    tower.applyUpgrade(upgradeConfig);
    return tower;
  }

  getAvailableUpgrades(type: TowerType): UpgradeType[] {
    return [...upgradeTree[type]];
  }

  getBaseTowerTypeByUpgrade(type: UpgradeType): TowerType {
    return baseTowerTypeByUpgrade[type];
  }

  getTowerCost(id: TowerType | UpgradeType): number {
    return this.getTowerConfig(id).cost;
  }

  private getTowerConfig(id: TowerType | UpgradeType): TowerConfig {
    const config = towerById.get(id);
    if (!config) {
      throw new Error(`Unknown tower type: ${id}`);
    }
    return { ...config };
  }

  private getBaseType(id: TowerType | UpgradeType): TowerType {
    if (id in baseTowerTypeByUpgrade) {
      return baseTowerTypeByUpgrade[id as UpgradeType];
    }
    return id as TowerType;
  }
}
