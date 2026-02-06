import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  
  return {
    theme,
    isDark,
    colorScheme,
  };
}
