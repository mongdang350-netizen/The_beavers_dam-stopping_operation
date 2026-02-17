import type { I18nKey } from '@/i18n/keys';
import { ko } from '@/i18n/ko';
import { en } from '@/i18n/en';

export type Language = 'ko' | 'en';

const translations: Record<Language, Record<I18nKey, string>> = { ko, en };

/** Font family mapping per language */
const fontFamilies: Record<Language, {
  logo: string;
  ui: string;
  dialogue: string;
  number: string;
}> = {
  ko: {
    logo: "'Cafe24Dangdanghae', 'Fredoka One', sans-serif",
    ui: "'Cafe24SsurroundAir', 'Fredoka One', sans-serif",
    dialogue: "'Typo_DodamDodam', 'Fredoka One', sans-serif",
    number: "'Sniglet', 'Fredoka One', sans-serif",
  },
  en: {
    logo: "'Fredoka One', sans-serif",
    ui: "'Fredoka One', sans-serif",
    dialogue: "'Fredoka One', sans-serif",
    number: "'Sniglet', 'Fredoka One', sans-serif",
  },
};

class I18nManager {
  private language: Language = 'ko';
  private readonly listeners: Array<() => void> = [];

  /** Get translated text for a key */
  t(key: I18nKey): string {
    return translations[this.language][key] ?? key;
  }

  /** Get current language */
  getLanguage(): Language {
    return this.language;
  }

  /** Set language and notify listeners */
  setLanguage(lang: Language): void {
    if (this.language === lang) return;
    this.language = lang;
    this.listeners.forEach((callback) => callback());
  }

  /** Get font family for a specific usage context */
  getFont(usage: 'logo' | 'ui' | 'dialogue' | 'number'): string {
    return fontFamilies[this.language][usage];
  }

  /** Register a callback for language changes */
  onChange(callback: () => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /** Get available languages */
  getAvailableLanguages(): Language[] {
    return ['ko', 'en'];
  }
}

/** Singleton */
export const i18n = new I18nManager();
