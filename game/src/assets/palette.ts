/** Pastel color palette for all pixel art assets */
export const PASTEL_PALETTE = {
  // Beaver colors
  BEAVER_BROWN: 0xC4956A,
  BEAVER_DARK_BROWN: 0x8B6914,
  BEAVER_CREAM: 0xFFF3D6,

  // Outline and details
  OUTLINE: 0x2D1B0E,
  EYE_WHITE: 0xFFFFFF,
  EYE_BLACK: 0x1A1A1A,
  TEETH_WHITE: 0xFFFFF0,

  // Environment
  GRASS_LIGHT: 0xA8D8A8,
  GRASS_DARK: 0x7BC47B,
  RIVER_LIGHT: 0x87CEEB,
  RIVER_DARK: 0x5BA3D9,

  // Building materials
  WOOD_LIGHT: 0xD4A76A,
  WOOD_DARK: 0x8B6914,
  STONE_LIGHT: 0xC8C8C8,
  STONE_DARK: 0x808080,

  // Special
  TRANSPARENT: -1,  // sentinel for no pixel

  // Warm colors
  FIRE_RED: 0xE85D4A,
  FIRE_ORANGE: 0xF4A460,
  GOLD_YELLOW: 0xFFD700,
  LIGHT_YELLOW: 0xFFFACD,
  SALMON: 0xFA8072,

  // Cool colors
  MAGIC_PURPLE: 0x9B59B6,
  DARK_PURPLE: 0x6B3FA0,
  TEAL: 0x1ABC9C,
  DARK_TEAL: 0x008B8B,
  ICE_BLUE: 0xADD8E6,

  // Earth tones
  DARK_RED: 0x8B0000,
  RUST: 0xB7410E,
  WARM_BROWN: 0xA0522D,
  OLIVE: 0x6B8E23,
  PINK: 0xFFB6C1,
  DARK_OLIVE: 0x556B2F,
} as const;

export type PaletteColor = typeof PASTEL_PALETTE[keyof typeof PASTEL_PALETTE];

/** Map palette index (0-31) to actual color values for compact pixel data */
export const PALETTE_INDEX: readonly number[] = [
  -1,                         // 0 = transparent
  PASTEL_PALETTE.OUTLINE,     // 1 = outline
  PASTEL_PALETTE.BEAVER_BROWN,// 2 = beaver brown
  PASTEL_PALETTE.BEAVER_CREAM,// 3 = beaver cream
  PASTEL_PALETTE.EYE_WHITE,   // 4 = eye white
  PASTEL_PALETTE.EYE_BLACK,   // 5 = eye black
  PASTEL_PALETTE.TEETH_WHITE, // 6 = teeth
  PASTEL_PALETTE.WOOD_LIGHT,  // 7 = wood light
  PASTEL_PALETTE.WOOD_DARK,   // 8 = wood dark
  PASTEL_PALETTE.STONE_LIGHT, // 9 = stone light
  PASTEL_PALETTE.STONE_DARK,  // 10 = stone dark
  PASTEL_PALETTE.GRASS_LIGHT, // 11 = grass light
  PASTEL_PALETTE.GRASS_DARK,  // 12 = grass dark
  PASTEL_PALETTE.RIVER_LIGHT, // 13 = river light
  PASTEL_PALETTE.RIVER_DARK,  // 14 = river dark
  PASTEL_PALETTE.BEAVER_DARK_BROWN, // 15 = beaver dark brown
  PASTEL_PALETTE.FIRE_RED,       // 16 = fire red
  PASTEL_PALETTE.FIRE_ORANGE,    // 17 = fire orange
  PASTEL_PALETTE.GOLD_YELLOW,    // 18 = gold yellow
  PASTEL_PALETTE.LIGHT_YELLOW,   // 19 = light yellow
  PASTEL_PALETTE.MAGIC_PURPLE,   // 20 = magic purple
  PASTEL_PALETTE.DARK_PURPLE,    // 21 = dark purple
  PASTEL_PALETTE.TEAL,           // 22 = teal
  PASTEL_PALETTE.DARK_TEAL,      // 23 = dark teal
  PASTEL_PALETTE.ICE_BLUE,       // 24 = ice blue
  PASTEL_PALETTE.SALMON,         // 25 = salmon
  PASTEL_PALETTE.DARK_RED,       // 26 = dark red
  PASTEL_PALETTE.RUST,           // 27 = rust
  PASTEL_PALETTE.WARM_BROWN,     // 28 = warm brown
  PASTEL_PALETTE.OLIVE,          // 29 = olive
  PASTEL_PALETTE.PINK,           // 30 = pink
  PASTEL_PALETTE.DARK_OLIVE,     // 31 = dark olive
] as const;
