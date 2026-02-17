import Phaser from 'phaser';
import { toScreen, ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '@/core/IsometricUtils';
import type { Position } from '@/types';

/** Grid dimensions for the default map */
const GRID_COLS = 10;
const GRID_ROWS = 10;

/** Predefined decoration positions (grid coordinates) */
const TREE_POSITIONS: { gridX: number; gridY: number; type: 'tree1' | 'tree2' }[] = [
  { gridX: 0, gridY: 0, type: 'tree1' },
  { gridX: 1, gridY: 1, type: 'tree2' },
  { gridX: 9, gridY: 0, type: 'tree1' },
  { gridX: 0, gridY: 5, type: 'tree2' },
  { gridX: 9, gridY: 4, type: 'tree1' },
  { gridX: 0, gridY: 9, type: 'tree2' },
  { gridX: 9, gridY: 9, type: 'tree1' },
  { gridX: 1, gridY: 8, type: 'tree2' },
  { gridX: 8, gridY: 8, type: 'tree1' },
];

const STUMP_POSITIONS: { gridX: number; gridY: number }[] = [
  { gridX: 3, gridY: 1 },
  { gridX: 6, gridY: 7 },
];

/**
 * Renders the isometric tile map background using pixel art textures.
 * Draws grass tiles, river tiles along waypoints, and decoration sprites.
 */
export class BackgroundRenderer {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  /**
   * Draw the full background: grass tiles, river path, and decorations.
   * @param riverPath Screen-coordinate waypoints defining the river
   * @param damPosition Screen-coordinate position of the dam
   */
  render(riverPath: Position[], _damPosition: Position): void {
    this.drawGrassTiles();
    this.drawRiver(riverPath);
    this.drawDecorations();
  }

  destroy(): void {
    this.objects.forEach((obj) => obj.destroy());
    this.objects.length = 0;
  }

  private drawGrassTiles(): void {
    for (let gy = 0; gy < GRID_ROWS; gy++) {
      for (let gx = 0; gx < GRID_COLS; gx++) {
        const { screenX, screenY } = toScreen(gx, gy);
        // Pick a grass variant based on position for natural look
        const variant = ((gx + gy) % 3) + 1;
        const key = `tile_grass_${variant}`;

        if (this.scene.textures.exists(key)) {
          const tile = this.scene.add.sprite(screenX, screenY, key);
          // Scale pixel art tile to match isometric grid dimensions
          tile.setDisplaySize(ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
          tile.setDepth(1);
          this.objects.push(tile);
        }
      }
    }
  }

  private drawRiver(riverPath: Position[]): void {
    if (riverPath.length < 2) return;

    // Draw river as a thick line using Graphics (simple approach)
    // The river textures are available but the complex river tiling
    // (straight vs curve detection) can be enhanced later.
    const river = this.scene.add.graphics();
    river.lineStyle(48, 0x5BA3D9, 0.8);
    river.beginPath();
    river.moveTo(riverPath[0].x, riverPath[0].y);
    for (let i = 1; i < riverPath.length; i++) {
      river.lineTo(riverPath[i].x, riverPath[i].y);
    }
    river.strokePath();
    river.setDepth(2);
    this.objects.push(river);

    // Add river highlight line on top
    const highlight = this.scene.add.graphics();
    highlight.lineStyle(16, 0x87CEEB, 0.5);
    highlight.beginPath();
    highlight.moveTo(riverPath[0].x, riverPath[0].y);
    for (let i = 1; i < riverPath.length; i++) {
      highlight.lineTo(riverPath[i].x, riverPath[i].y);
    }
    highlight.strokePath();
    highlight.setDepth(3);
    this.objects.push(highlight);
  }

  private drawDecorations(): void {
    // Trees
    for (const tree of TREE_POSITIONS) {
      const { screenX, screenY } = toScreen(tree.gridX, tree.gridY);
      const key = `tile_${tree.type}`;
      if (this.scene.textures.exists(key)) {
        const sprite = this.scene.add.sprite(screenX, screenY - 16, key);
        sprite.setDepth(5 + screenY);
        this.objects.push(sprite);
      }
    }

    // Stumps
    for (const pos of STUMP_POSITIONS) {
      const { screenX, screenY } = toScreen(pos.gridX, pos.gridY);
      const key = 'tile_stump';
      if (this.scene.textures.exists(key)) {
        const sprite = this.scene.add.sprite(screenX, screenY, key);
        sprite.setDepth(4 + screenY);
        this.objects.push(sprite);
      }
    }
  }
}
