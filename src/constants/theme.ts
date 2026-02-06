export const lightTheme = {
  background: '#FDFCF8',
  surface: '#FFFFFF',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#e5e5e5',
  accent: '#8B4513',
  accentLight: '#D4A574',
  germanText: '#1a1a1a',
  spanishText: '#555555',
  highlight: '#FFF9E6',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const darkTheme = {
  background: '#0d0d0d',
  surface: '#1a1a1a',
  text: '#E8E6E3',
  textSecondary: '#9A9590',
  textMuted: '#6B6560',
  border: '#2d2d2d',
  accent: '#C49A6C',
  accentLight: '#8B7355',
  germanText: '#E8E6E3',
  spanishText: '#B0ABA6',
  highlight: '#2A2520',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export type Theme = typeof lightTheme;
