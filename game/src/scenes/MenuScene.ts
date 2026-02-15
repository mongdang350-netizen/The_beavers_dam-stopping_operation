import Phaser from 'phaser';
import { audioManager } from '@/audio/audioStore';
import { textsData } from '@/data/validatedData';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { createTextButton } from '@/ui/TextButton';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export class MenuScene extends Phaser.Scene {
  private settingsPanelItems: Phaser.GameObjects.GameObject[] = [];
  private settingsText?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.MENU);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0f2335');
    audioManager.playBgm('menu');

    this.add
      .text(GAME_WIDTH / 2, 140, '비버들의 댐막기 대작전', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '54px',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.createButton(GAME_WIDTH / 2, 300, textsData.ko.start, () => {
      this.scene.start(SCENE_KEYS.GAME);
    });

    this.createButton(GAME_WIDTH / 2, 370, '설정 (BGM/SFX)', () => this.toggleSettingsPanel());

    this.createButton(GAME_WIDTH / 2, 440, '크레딧', () => {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Made with Phaser + TypeScript', {
          color: '#cfd8dc',
          fontFamily: 'sans-serif',
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

  private createButton(x: number, y: number, text: string, onClick: () => void): void {
    createTextButton(this, {
      x,
      y,
      label: text,
      onClick,
      style: {
        color: '#111111',
        backgroundColor: '#ffe082',
        fontFamily: 'sans-serif',
        fontSize: '28px',
        padding: { x: 14, y: 8 },
      },
    });
  }

  private toggleSettingsPanel(): void {
    if (this.settingsPanelItems.length > 0) {
      this.settingsPanelItems.forEach((item) => item.destroy());
      this.settingsPanelItems = [];
      this.settingsText = undefined;
      return;
    }

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 230, 0x102a3e, 0.94);
    bg.setStrokeStyle(2, 0xcfd8dc).setDepth(1200);

    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 82, '오디오 설정', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '28px',
      })
      .setOrigin(0.5)
      .setDepth(1201);

    this.settingsText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 25, '', {
        color: '#dceffd',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1201);
    this.refreshSettingsText();

    const controls: Phaser.GameObjects.Text[] = [];
    controls.push(
      this.createSettingsButton(GAME_WIDTH / 2 - 110, GAME_HEIGHT / 2 + 25, 'BGM -', () => {
        audioManager.adjustBgmVolume(-0.1);
        this.refreshSettingsText();
      }),
    );
    controls.push(
      this.createSettingsButton(GAME_WIDTH / 2 - 30, GAME_HEIGHT / 2 + 25, 'BGM +', () => {
        audioManager.adjustBgmVolume(0.1);
        this.refreshSettingsText();
      }),
    );
    controls.push(
      this.createSettingsButton(GAME_WIDTH / 2 + 30, GAME_HEIGHT / 2 + 25, 'SFX -', () => {
        audioManager.adjustSfxVolume(-0.1);
        this.refreshSettingsText();
      }),
    );
    controls.push(
      this.createSettingsButton(GAME_WIDTH / 2 + 110, GAME_HEIGHT / 2 + 25, 'SFX +', () => {
        audioManager.adjustSfxVolume(0.1);
        this.refreshSettingsText();
      }),
    );
    controls.push(
      this.createSettingsButton(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 75, '음소거', () => {
        audioManager.toggleMuted();
        this.refreshSettingsText();
      }),
    );
    controls.push(
      this.createSettingsButton(GAME_WIDTH / 2 + 70, GAME_HEIGHT / 2 + 75, '닫기', () => {
        this.toggleSettingsPanel();
      }),
    );

    this.settingsPanelItems = [
      bg,
      title,
      this.settingsText,
      ...controls,
    ];
  }

  private createSettingsButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    return createTextButton(this, {
      x,
      y,
      label,
      onClick,
      style: {
        color: '#111111',
        backgroundColor: '#ffe082',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        padding: { x: 10, y: 6 },
      },
      depth: 1201,
    });
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
