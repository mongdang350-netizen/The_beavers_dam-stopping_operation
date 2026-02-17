/** Font configuration mapped by usage context and language */
export const FONTS = {
  logo: {
    ko: "'Jua', sans-serif",
    en: "'Fredoka One', sans-serif",
  },
  ui: {
    ko: "'Gothic A1', sans-serif",
    en: "'Fredoka One', sans-serif",
  },
  dialogue: {
    ko: "'Nanum Pen Script', cursive",
    en: "'Fredoka One', sans-serif",
  },
  score: "'Fredoka One', sans-serif",
} as const;

export type FontContext = keyof typeof FONTS;

/** Get font family string for current language context */
export function getFont(context: FontContext, lang: 'ko' | 'en' = 'ko'): string {
  const entry = FONTS[context];
  if (typeof entry === 'string') return entry;
  return entry[lang];
}
