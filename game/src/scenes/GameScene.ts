import Phaser from 'phaser';
import { audioManager } from '@/audio/audioStore';
import { mapsData } from '@/data/validatedData';
import { DebugController } from '@/debug/DebugController';
import { DebugPanel } from '@/debug/DebugPanel';
import { shouldShowDebugPanel } from '@/debug/debugVisibility';
import { BackgroundRenderer } from '@/renderers/BackgroundRenderer';
import { DamRenderer } from '@/renderers/DamRenderer';
import { EnemyRenderer } from '@/renderers/EnemyRenderer';
import { EffectRenderer } from '@/renderers/EffectRenderer';
import { ProjectileRenderer } from '@/renderers/ProjectileRenderer';
import { SoldierRenderer } from '@/renderers/SoldierRenderer';
import { TowerRenderer } from '@/renderers/TowerRenderer';
import { registerAllTextures } from '@/renderers/textureRegistration';
import { visualPolicy } from '@/renderers/visualPolicy';
import { GameSession } from '@/scenes/GameSession';
import { buildGameSceneLayout } from '@/scenes/layout';
import { ResourceCleanup } from '@/scenes/resourceCleanup';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { HUD } from '@/ui/HUD';
import { RallyPointDragger } from '@/ui/RallyPointDragger';
import { SpeedControl } from '@/ui/SpeedControl';
import { TowerPalette } from '@/ui/TowerPalette';
import { UpgradePalette } from '@/ui/UpgradePalette';
import { WaveStartButton } from '@/ui/WaveStartButton';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export class GameScene extends Phaser.Scene {
  private session!: GameSession;
  private backgroundRenderer!: BackgroundRenderer;
  private damRenderer!: DamRenderer;
  private enemyRenderer!: EnemyRenderer;
  private towerRenderer!: TowerRenderer;
  private projectileRenderer!: ProjectileRenderer;
  private soldierRenderer!: SoldierRenderer;
  private effectRenderer!: EffectRenderer;
  private hud!: HUD;
  private towerPalette!: TowerPalette;
  private upgradePalette!: UpgradePalette;
  private rallyPointDragger!: RallyPointDragger;
  private waveStartButton!: WaveStartButton;
  private speedControl!: SpeedControl;
  private debugPanel?: DebugPanel;
  private flashOverlay?: Phaser.GameObjects.Rectangle;
  private readonly cleanup = new ResourceCleanup();
  private ignoreOutsideClickOnce = false;
  private readonly bossIdsSeen = new Set<string>();

  constructor() {
    super(SCENE_KEYS.GAME);
  }

  create(): void {
    this.session = new GameSession();

    // Register all pixel art textures and animations
    registerAllTextures(this);

    const layout = buildGameSceneLayout(mapsData.defaultMap);

    // Set background color
    this.cameras.main.setBackgroundColor(visualPolicy.backgroundLandColor);

    // Draw background tiles, river, and decorations
    this.backgroundRenderer = new BackgroundRenderer(this);
    this.backgroundRenderer.render(layout.riverPath, layout.damPosition);

    // Create dam renderer
    this.damRenderer = new DamRenderer(this, layout.damPosition);
    this.damRenderer.create();

    this.towerRenderer = new TowerRenderer(this);
    this.enemyRenderer = new EnemyRenderer(this);
    this.projectileRenderer = new ProjectileRenderer(this);
    this.soldierRenderer = new SoldierRenderer(this, this.session.soldierSystem);
    this.effectRenderer = new EffectRenderer(this);
    this.hud = new HUD(this);

    this.towerPalette = new TowerPalette(
      this,
      (cost) => this.session.goldManager.canAfford(cost),
      (slotIndex, towerType) => {
        this.session.placeTower(slotIndex, towerType);
      },
    );
    this.upgradePalette = new UpgradePalette(this);

    this.rallyPointDragger = new RallyPointDragger(this, (slotIndex, x, y) => {
      this.session.setRallyPoint(slotIndex, x, y);
    });

    this.towerRenderer.renderSlots(this.session.pathSystem.getTowerSlots(), (slotIndex) => {
      this.ignoreOutsideClickOnce = true;
      const slot = this.session.pathSystem.getTowerSlots().find((item) => item.id === slotIndex);
      if (!slot) {
        return;
      }

      const tower = this.session.gameState.towers.get(slotIndex);
      if (!tower) {
        this.upgradePalette.close();
        this.rallyPointDragger.hide();
        this.towerPalette.open(slotIndex, slot.x, slot.y);
        return;
      }

      this.towerPalette.close();
      const upgrades = this.session.upgradeSystem.getAvailableUpgrades(slotIndex);
      this.upgradePalette.open(
        slot.x,
        slot.y,
        tower,
        upgrades,
        (cost) => this.session.goldManager.canAfford(cost),
        (upgradeType) => this.session.getUpgradeCost(upgradeType),
        (upgradeType) => {
          this.session.upgradeTower(slotIndex, upgradeType);
        },
        () => {
          this.session.sellTower(slotIndex);
          this.rallyPointDragger.hide();
        },
      );

      if (tower.config.special?.summonSoldiers) {
        this.rallyPointDragger.show(slotIndex, tower.position.x, tower.position.y);
      } else {
        this.rallyPointDragger.hide();
      }
    });

    this.waveStartButton = new WaveStartButton(this, () => {
      this.session.startWave();
    });
    this.speedControl = new SpeedControl(
      this,
      () => this.session.toggleSpeed(),
      () => this.session.togglePause(),
    );

    if (shouldShowDebugPanel(import.meta.env.DEV)) {
      this.debugPanel = new DebugPanel(this, new DebugController(this.session));
    }

    this.registerInputHandlers();
    this.registerSessionEvents();
    this.playStageBgm(this.session.gameState.currentStage);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupScene());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupScene());

    this.syncRenderers();
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    if (this.session.gameState.gameStatus === 'playing') {
      this.session.update(dt);
    }

    // Tick wave countdown even during preparing status
    if (this.session.waveSystem.state === 'countdown') {
      this.session.waveSystem.update(dt, this.session.gameState.currentStage, this.session.gameState.currentWave);
      // Auto-start wave when countdown reaches zero
      if (this.session.waveSystem.getCountdown() <= 0) {
        this.session.startWave();
      }
    }

    this.waveStartButton.setVisible(this.session.gameState.gameStatus === 'preparing');
    const waveState = this.session.waveSystem.state;
    const countdown = this.session.waveSystem.getCountdown();
    this.waveStartButton.update(waveState, countdown);
    this.syncRenderers();
    this.checkBossArrival();
  }

  private syncRenderers(): void {
    const state = this.session.gameState;
    this.enemyRenderer.sync(state.enemies);
    this.towerRenderer.sync([...state.towers.values()]);
    this.projectileRenderer.sync(state.projectiles);
    this.soldierRenderer.sync();
    this.effectRenderer.sync(state.enemies);
    this.damRenderer.sync(state.damHp, state.damMaxHp);
    this.hud.refresh(
      {
        gold: state.gold,
        currentStage: state.currentStage,
        currentWave: state.currentWave,
        damHp: state.damHp,
        damMaxHp: state.damMaxHp,
        speed: state.speed,
        paused: state.gameStatus === 'paused',
      },
      state.enemies.length,
    );
  }

  private flashDamHit(): void {
    if (!this.flashOverlay) {
      this.flashOverlay = this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff5252, 0)
        .setDepth(1500)
        .setScrollFactor(0);
    }

    this.tweens.killTweensOf(this.flashOverlay);
    this.flashOverlay.setAlpha(0.22);
    this.tweens.add({ targets: this.flashOverlay, alpha: 0, duration: 180 });
  }

  private checkBossArrival(): void {
    this.session.gameState.enemies
      .filter((enemy) => enemy.config.isBoss)
      .forEach((enemy) => {
        if (this.bossIdsSeen.has(enemy.id)) {
          return;
        }
        this.bossIdsSeen.add(enemy.id);
        this.cameras.main.shake(200, 0.003);
        audioManager.playSfx('bossWarning');
      });
  }

  private cleanupScene(): void {
    audioManager.stopBgm();
    this.cleanup.disposeAll();
    this.backgroundRenderer?.destroy();
    this.damRenderer?.destroy();
    this.enemyRenderer?.destroy();
    this.towerRenderer?.destroy();
    this.projectileRenderer?.destroy();
    this.soldierRenderer?.destroy();
    this.effectRenderer?.destroy();
    this.hud?.destroy();
    this.towerPalette?.destroy();
    this.upgradePalette?.destroy();
    this.rallyPointDragger?.destroy();
    this.waveStartButton?.destroy();
    this.speedControl?.destroy();
    this.debugPanel?.destroy();
    this.flashOverlay?.destroy();
  }

  private registerInputHandlers(): void {
    const onPointerDown = (
      _pointer: Phaser.Input.Pointer,
      currentlyOver: Phaser.GameObjects.GameObject[],
    ): void => {
      if (this.ignoreOutsideClickOnce) {
        this.ignoreOutsideClickOnce = false;
        return;
      }

      const clickedPalette = currentlyOver.some(
        (go) => this.towerPalette.contains(go) || this.upgradePalette.contains(go),
      );
      if (clickedPalette) {
        return;
      }

      this.towerPalette.close();
      this.upgradePalette.close();
      this.rallyPointDragger.hide();
    };
    this.input.on('pointerdown', onPointerDown);
    this.cleanup.track(() => this.input.off('pointerdown', onPointerDown));
  }

  private registerSessionEvents(): void {
    this.cleanup.track(
      this.session.eventBus.on('damDamaged', () => {
        this.flashDamHit();
        audioManager.playSfx('damHit');
      }),
    );
    this.cleanup.track(
      this.session.eventBus.on('gameOver', () => {
        audioManager.playSfx('gameOver');
        this.scene.start(SCENE_KEYS.GAME_OVER);
      }),
    );
    this.cleanup.track(
      this.session.eventBus.on('victory', ({ score, stars }) => {
        audioManager.playSfx('victory');
        this.scene.start(SCENE_KEYS.VICTORY, { score, stars });
      }),
    );
    this.cleanup.track(this.session.eventBus.on('towerPlaced', () => audioManager.playSfx('placeTower')));
    this.cleanup.track(this.session.eventBus.on('towerUpgraded', () => audioManager.playSfx('upgradeTower')));
    this.cleanup.track(this.session.eventBus.on('towerSold', () => audioManager.playSfx('sellTower')));
    this.cleanup.track(this.session.eventBus.on('enemyKilled', () => audioManager.playSfx('enemyDefeated')));
    this.cleanup.track(this.session.eventBus.on('waveStart', () => audioManager.playSfx('waveStart')));
    this.cleanup.track(this.session.eventBus.on('stageStart', ({ stageId }) => this.playStageBgm(stageId)));
  }

  private playStageBgm(stageId: number): void {
    const track = stageId === 5 || stageId === 10 ? 'boss' : 'game';
    audioManager.playBgm(track);
  }
}
