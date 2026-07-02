// Davidson College official brand palette.
// Source: https://marketing-toolbox.dcreate.domains/branding-assets/color/
// Mirrors the Tailwind tokens defined in src/styles/global.css — use this module
// wherever a plain hex string is needed (e.g. FullCalendar event colors), and the
// Tailwind classes (bg-davidson-red, text-lake-blue, etc.) everywhere else.
export const davidsonColors = {
  red: '#D42121',
  redDeep: '#A81C1C',
  redLight: '#E66E6E',
  black: '#0F1012',
  white: '#FFFFFF',
  sandstone: '#E9DED3',
  deepTaupe: '#9F8B76',
  lakeBlue: '#294878',
  coolGray1: '#F9F5F2',
  coolGray3: '#D4CFCE',
  coolGray6: '#B0ABAB',
  coolGray8: '#8D898A',
  coolGray10: '#6A6869',
  gray7540: '#4A484A',
} as const;
