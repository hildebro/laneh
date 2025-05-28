export const transLocale = (locale: string): string => {
  switch (locale) {
    case 'de':
      return '🇩🇪';
    case 'en':
      return '🇬🇧';
    default:
      return locale;
  }
};
