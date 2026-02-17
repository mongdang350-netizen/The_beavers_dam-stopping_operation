export const I18N_KEYS = {
  // Menu
  MENU: {
    TITLE: 'menu.title',
    START: 'menu.start',
    STAGE_SELECT: 'menu.stageSelect',
    SETTINGS: 'menu.settings',
    CREDITS: 'menu.credits',
    LANGUAGE: 'menu.language',
  },
  // Tower names (5 base + 7 upgrades = 12)
  TOWER: {
    AGILE: 'tower.agile',
    ARCHER: 'tower.archer',
    BLOWGUNNER: 'tower.blowgunner',
    BRAVE: 'tower.brave',
    KNIGHT: 'tower.knight',
    BARBARIAN: 'tower.barbarian',
    CAPABLE: 'tower.capable',
    DRAGON_TAMER: 'tower.dragonTamer',
    WIZARD: 'tower.wizard',
    SMART: 'tower.smart',
    LOG_ROLLER: 'tower.logRoller',
    WATER_BOMBER: 'tower.waterBomber',
  },
  // Enemy names
  ENEMY: {
    PIRANHA: 'enemy.piranha',
    CATFISH: 'enemy.catfish',
    IGUANA: 'enemy.iguana',
    WATER_SNAKE: 'enemy.waterSnake',
    TURTLE: 'enemy.turtle',
    ANACONDA: 'enemy.anaconda',
    CROCODILE: 'enemy.crocodile',
    HIPPO: 'enemy.hippo',
    ELEPHANT: 'enemy.elephant',
  },
  // UI elements
  UI: {
    GOLD: 'ui.gold',
    WAVE: 'ui.wave',
    STAGE: 'ui.stage',
    DAM_HP: 'ui.damHp',
    SPEED: 'ui.speed',
    PAUSE: 'ui.pause',
    RESUME: 'ui.resume',
    SELL: 'ui.sell',
    UPGRADE: 'ui.upgrade',
    COUNTDOWN: 'ui.countdown',
    ENEMIES_LEFT: 'ui.enemiesLeft',
  },
  // Settings
  SETTINGS: {
    AUDIO: 'settings.audio',
    BGM: 'settings.bgm',
    SFX: 'settings.sfx',
    MUTE: 'settings.mute',
    CLOSE: 'settings.close',
  },
  // Game states
  GAME: {
    GAME_OVER: 'game.gameOver',
    VICTORY: 'game.victory',
    SCORE: 'game.score',
    STARS: 'game.stars',
    RETRY: 'game.retry',
    BACK_TO_MENU: 'game.backToMenu',
    NEXT_STAGE: 'game.nextStage',
    WAVE_START: 'game.waveStart',
    BOSS_WARNING: 'game.bossWarning',
  },
} as const;

/** Extract all possible i18n key string values */
type DeepValues<T> = T extends string ? T : T extends object ? DeepValues<T[keyof T]> : never;
export type I18nKey = DeepValues<typeof I18N_KEYS>;
