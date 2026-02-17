import Phaser from 'phaser';
import { audioManager } from '@/audio/audioStore';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { createTextButton } from '@/ui/TextButton';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export class MenuScene extends Phaser.Scene {
  private settingsPanelItems: Phaser.GameObjects.GameObject[] = [];
  private settingsText?: Phaser.GameObjects.Text;
  private stageSelectItems: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SCENE_KEYS.MENU);
  }

  create(): void {
    // Gradient background: forest green to dark green
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2d5f3e)
      .setOrigin(0, 0);
    this.add.rectangle(0, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT / 2, 0x1a3a2a)
      .setOrigin(0, 0)
      .setAlpha(0.6);

    audioManager.playBgm('menu');

    // Game logo with kawaii styling
    this.add
      .text(GAME_WIDTH / 2, 140, '비버들의 댐막기 대작전', {
        color: '#FFE082',
        fontFamily: '"Jua", "Fredoka One", sans-serif',
        fontSize: '48px',
        stroke: '#5D4037',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // Pastel card-style buttons
    this.createPastelButton(GAME_WIDTH / 2, 280, '게임 시작', 0xA5D6A7, () => {
      this.scene.start(SCENE_KEYS.GAME);
    });

    this.createPastelButton(GAME_WIDTH / 2, 350, '스테이지 선택', 0x90CAF9, () => {
      this.showStageSelect();
    });

    this.createPastelButton(GAME_WIDTH / 2, 420, '설정', 0xFFE082, () => {
      this.toggleSettingsPanel();
    });

    this.createPastelButton(GAME_WIDTH / 2, 490, '크레딧', 0xCE93D8, () => {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Made with Phaser + TypeScript', {
          color: '#FFF8E7',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
        })
        .setOrigin(0.5)
        .setDepth(1000)
        .setAlpha(0)
        .setData('temporary', true);

      const latest = this.children
        .getAll()
        .find((child) => child.getData('temporary')) as Phaser.GameObjects.Text | undefined;
      if (!latest) {
        return;
      }
      this.tweens.add({
        targets: latest,
        alpha: 1,
        duration: 220,
        yoyo: true,
        hold: 900,
        onComplete: () => latest.destroy(),
      });
    });
  }

  private createPastelButton(x: number, y: number, label: string, bgColor: number, onClick: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(x - 120, y - 25, 240, 50, 12);

    const text = this.add
      .text(x, y, label, {
        color: '#3E2723',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '22px',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);

    // Hover effect
    text.on('pointerover', () => {
      this.tweens.add({ targets: text, scale: 1.1, duration: 100 });
    });
    text.on('pointerout', () => {
      this.tweens.add({ targets: text, scale: 1, duration: 100 });
    });
  }

  private showStageSelect(): void {
    if (this.stageSelectItems.length > 0) {
      return;
    }

    // Dark overlay
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setDepth(1100)
      .setInteractive();

    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x3E2723, 0.95);
    panelBg.fillRoundedRect(GAME_WIDTH / 2 - 280, GAME_HEIGHT / 2 - 200, 560, 400, 16);
    panelBg.setDepth(1101);

    // Title
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, '스테이지 선택', {
        color: '#FFF8E7',
        fontFamily: '"Jua", "Fredoka One", sans-serif',
        fontSize: '32px',
      })
      .setOrigin(0.5)
      .setDepth(1102);

    // Stage buttons in 5x2 grid
    const stageButtons: Phaser.GameObjects.GameObject[] = [];
    for (let i = 0; i < 10; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const btnX = GAME_WIDTH / 2 - 200 + col * 100;
      const btnY = GAME_HEIGHT / 2 - 70 + row * 100;

      const stageBg = this.add.graphics();
      stageBg.fillStyle(0xA5D6A7, 1);
      stageBg.fillRoundedRect(btnX - 35, btnY - 35, 70, 70, 8);
      stageBg.setDepth(1102);

      const stageText = this.add
        .text(btnX, btnY, `${i + 1}`, {
          color: '#3E2723',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '28px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(1103)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.closeStageSelect();
          this.scene.start(SCENE_KEYS.GAME, { stageId: i + 1 });
        });

      stageText.on('pointerover', () => {
        this.tweens.add({ targets: stageText, scale: 1.2, duration: 100 });
      });
      stageText.on('pointerout', () => {
        this.tweens.add({ targets: stageText, scale: 1, duration: 100 });
      });

      stageButtons.push(stageBg, stageText);
    }

    // Back button
    const backBg = this.add.graphics();
    backBg.fillStyle(0xFFE082, 1);
    backBg.fillRoundedRect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 140, 120, 40, 8);
    backBg.setDepth(1102);

    const backText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, '뒤로', {
        color: '#3E2723',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '20px',
      })
      .setOrigin(0.5)
      .setDepth(1103)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeStageSelect());

    this.stageSelectItems = [overlay, panelBg, title, ...stageButtons, backBg, backText];
  }

  private closeStageSelect(): void {
    this.stageSelectItems.forEach((item) => item.destroy());
    this.stageSelectItems = [];
  }

  private toggleSettingsPanel(): void {
    if (this.settingsPanelItems.length > 0) {
      this.settingsPanelItems.forEach((item) => item.destroy());
      this.settingsPanelItems = [];
      this.settingsText = undefined;
      return;
    }

    // Panel background with pastel theme
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x3E2723, 0.9);
    panelBg.fillRoundedRect(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2 - 115, 420, 270, 16);
    panelBg.setDepth(1200);

    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 82, '오디오 설정', {
        color: '#FFF8E7',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '28px',
      })
      .setOrigin(0.5)
      .setDepth(1201);

    this.settingsText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 25, '', {
        color: '#FFF8E7',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '18px',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1201);
    this.refreshSettingsText();

    const controls: Phaser.GameObjects.Text[] = [];
    controls.push(
      createTextButton(this, {
        x: GAME_WIDTH / 2 - 110,
        y: GAME_HEIGHT / 2 + 25,
        label: 'BGM -',
        onClick: () => {
          audioManager.adjustBgmVolume(-0.1);
          this.refreshSettingsText();
        },
        style: {
          color: '#3E2723',
          backgroundColor: '#A5D6A7',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
          padding: { x: 10, y: 6 },
        },
        depth: 1201,
      }),
    );
    controls.push(
      createTextButton(this, {
        x: GAME_WIDTH / 2 - 30,
        y: GAME_HEIGHT / 2 + 25,
        label: 'BGM +',
        onClick: () => {
          audioManager.adjustBgmVolume(0.1);
          this.refreshSettingsText();
        },
        style: {
          color: '#3E2723',
          backgroundColor: '#A5D6A7',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
          padding: { x: 10, y: 6 },
        },
        depth: 1201,
      }),
    );
    controls.push(
      createTextButton(this, {
        x: GAME_WIDTH / 2 + 30,
        y: GAME_HEIGHT / 2 + 25,
        label: 'SFX -',
        onClick: () => {
          audioManager.adjustSfxVolume(-0.1);
          this.refreshSettingsText();
        },
        style: {
          color: '#3E2723',
          backgroundColor: '#A5D6A7',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
          padding: { x: 10, y: 6 },
        },
        depth: 1201,
      }),
    );
    controls.push(
      createTextButton(this, {
        x: GAME_WIDTH / 2 + 110,
        y: GAME_HEIGHT / 2 + 25,
        label: 'SFX +',
        onClick: () => {
          audioManager.adjustSfxVolume(0.1);
          this.refreshSettingsText();
        },
        style: {
          color: '#3E2723',
          backgroundColor: '#A5D6A7',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
          padding: { x: 10, y: 6 },
        },
        depth: 1201,
      }),
    );
    controls.push(
      createTextButton(this, {
        x: GAME_WIDTH / 2 - 70,
        y: GAME_HEIGHT / 2 + 75,
        label: '음소거',
        onClick: () => {
          audioManager.toggleMuted();
          this.refreshSettingsText();
        },
        style: {
          color: '#3E2723',
          backgroundColor: '#FFE082',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
          padding: { x: 10, y: 6 },
        },
        depth: 1201,
      }),
    );
    controls.push(
      createTextButton(this, {
        x: GAME_WIDTH / 2 + 70,
        y: GAME_HEIGHT / 2 + 75,
        label: '닫기',
        onClick: () => {
          this.toggleSettingsPanel();
        },
        style: {
          color: '#3E2723',
          backgroundColor: '#FFE082',
          fontFamily: '"Gothic A1", sans-serif',
          fontSize: '18px',
          padding: { x: 10, y: 6 },
        },
        depth: 1201,
      }),
    );

    // Language toggle button (visual only for now)
    const langBtn = createTextButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2 + 120,
      label: '한국어/English',
      onClick: () => {
        // Placeholder for future i18n switching
        console.log('Language toggle clicked');
      },
      style: {
        color: '#3E2723',
        backgroundColor: '#90CAF9',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '16px',
        padding: { x: 10, y: 6 },
      },
      depth: 1201,
    });

    this.settingsPanelItems = [
      panelBg,
      title,
      this.settingsText,
      ...controls,
      langBtn,
    ];
  }

  private refreshSettingsText(): void {
    if (!this.settingsText) {
      return;
    }
    const settings = audioManager.getSettings();
    this.settingsText.setText(
      `BGM: ${Math.round(settings.bgmVolume * 100)}%\nSFX: ${Math.round(settings.sfxVolume * 100)}%\n음소거: ${
        settings.muted ? 'ON' : 'OFF'
      }`,
    );
  }
}
