import { useStore } from './useStore';
import en from '../locales/en.json';
import vi from '../locales/vi.json';
import ko from '../locales/ko.json';

const translations = {
    en,
    vi,
    ko,
};

export function useTranslation() {
    const { settings } = useStore();
    const currentLanguage = settings.language || 'en';

    const t = translations[currentLanguage];

    return { t, language: currentLanguage };
}
