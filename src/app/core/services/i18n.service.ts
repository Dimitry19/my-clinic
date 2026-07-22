import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FR } from '../i18n/fr';
import { EN } from '../i18n/en';
import { TranslationKeys } from '../i18n/fr';

export type Lang = 'fr' | 'en';

export interface LangOption {
  code: Lang;
  label: string;
  flag: string; // emoji drapeau
  primeNgLocale: string;
}

export const LANG_OPTIONS: LangOption[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', primeNgLocale: 'fr' },
  { code: 'en', label: 'English', flag: '🇬🇧', primeNgLocale: 'en' },
];

const TRANSLATIONS: Record<Lang, TranslationKeys> = { fr: FR, en: EN };
const STORAGE_KEY = 'trinity_lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private platformId = inject(PLATFORM_ID);

  // ── State ──────────────────────────────────────────────
  currentLang = signal<Lang>(this.getInitialLang());
  t = computed(() => TRANSLATIONS[this.currentLang()]);
  currentOption = computed(
    () => LANG_OPTIONS.find((o) => o.code === this.currentLang())!,
  );

  // ── Changer la langue ──────────────────────────────────
  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  }

  // ── Traduction avec interpolation ──────────────────────
  // Exemple : translate('patient.registered', { count: 42 })
  // → "42 patient(s) enregistré(s)"
  translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = TRANSLATIONS[this.currentLang()];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    if (typeof value !== 'string') return key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
      value,
    );
  }

  // ── Init depuis localStorage ou navigateur ─────────────
  private getInitialLang(): Lang {
    if (!isPlatformBrowser(this.platformId)) return 'fr';
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && ['fr', 'en'].includes(stored)) return stored;
    const browser = navigator.language?.slice(0, 2) as Lang;
    return ['fr', 'en'].includes(browser) ? browser : 'fr';
  }
}
