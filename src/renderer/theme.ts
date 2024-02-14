// theme.ts
const themeObj = {
  light: [
    {
      label: '--primary-bg-color',
      color: '#fff',
    },
    {
      label: '--primary-color',
      color: '#000',
    },
  ],
  dark: [
    {
      label: '--primary-bg-color',
      color: '#232427',
    },
    {
      label: '--primary-color',
      color: '#fff',
    },
  ],
};

type ThemeType = 'light' | 'dark';

export function setUpTheme(theme: ThemeType) {
  const themeArr = themeObj[theme];

  themeArr?.forEach((item: any) => {
    document.body.style?.setProperty(item.label, item.color);
  });
}
