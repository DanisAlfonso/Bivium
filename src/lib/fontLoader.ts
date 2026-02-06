/**
 * Utilidades para cargar fuentes en WebView desde archivos locales
 * Las fuentes deben estar en assets/fonts/
 */

import { Platform } from 'react-native';

// Mapeo de fuentes a sus archivos
const fontFiles: Record<string, Record<string, string>> = {
  merriweather: {
    regular: 'Merriweather-Regular.ttf',
    bold: 'Merriweather-Bold.ttf',
  },
  lora: {
    regular: 'Lora-Regular.ttf',
    medium: 'Lora-Medium.ttf',
    semibold: 'Lora-SemiBold.ttf',
    bold: 'Lora-Bold.ttf',
  },
  literata: {
    regular: 'Literata-Regular.ttf',
    medium: 'Literata-Medium.ttf',
    semibold: 'Literata-SemiBold.ttf',
    bold: 'Literata-Bold.ttf',
  },
  crimson: {
    regular: 'CrimsonPro-Regular.ttf',
    medium: 'CrimsonPro-Medium.ttf',
    semibold: 'CrimsonPro-SemiBold.ttf',
    bold: 'CrimsonPro-Bold.ttf',
  },
  inter: {
    regular: 'Inter-Regular.ttf',
    medium: 'Inter-Medium.ttf',
    semibold: 'Inter-SemiBold.ttf',
  },
  sourceSans: {
    regular: 'SourceSans3-Regular.ttf',
    medium: 'SourceSans3-Medium.ttf',
    semibold: 'SourceSans3-SemiBold.ttf',
  },
  lato: {
    regular: 'Lato-Regular.ttf',
    bold: 'Lato-Bold.ttf',
  },
  jetbrains: {
    regular: 'JetBrainsMono-Regular.ttf',
    medium: 'JetBrainsMono-Medium.ttf',
  },
};

/**
 * Obtiene la ruta base para fuentes en el dispositivo
 */
function getFontBasePath(): string {
  if (Platform.OS === 'android') {
    return 'file:///android_asset/fonts/';
  }
  // En iOS, las fuentes se acceden desde el bundle principal
  return 'fonts/';
}

/**
 * Genera CSS @font-face para una fuente específica
 */
export function generateFontFaceCSS(fontName: string): string {
  const fonts = fontFiles[fontName];
  if (!fonts) {
    // Fallback a fuentes del sistema
    return '';
  }

  const basePath = getFontBasePath();
  let css = '';

  if (fonts.regular) {
    css += `@font-face {
  font-family: '${fontName}';
  src: url('${basePath}${fonts.regular}') format('truetype');
  font-weight: 400;
  font-style: normal;
}
`;
  }
  if (fonts.medium) {
    css += `@font-face {
  font-family: '${fontName}';
  src: url('${basePath}${fonts.medium}') format('truetype');
  font-weight: 500;
  font-style: normal;
}
`;
  }
  if (fonts.semibold) {
    css += `@font-face {
  font-family: '${fontName}';
  src: url('${basePath}${fonts.semibold}') format('truetype');
  font-weight: 600;
  font-style: normal;
}
`;
  }
  if (fonts.bold) {
    css += `@font-face {
  font-family: '${fontName}';
  src: url('${basePath}${fonts.bold}') format('truetype');
  font-weight: 700;
  font-style: normal;
}
`;
  }

  return css;
}

/**
 * Obtiene el nombre de fuente CSS para usar en estilos
 */
export function getFontFamilyName(fontName: string): string {
  // Si tenemos la fuente en nuestro mapa, usarla
  if (fontFiles[fontName]) {
    return fontName;
  }
  // Fallback a Georgia para serif
  return 'Georgia, serif';
}

/**
 * Obtiene fuentes del sistema según la categoría (para WebView fallback)
 */
export function getSystemFontFamily(fontName: string): string {
  // Mapeo de nuestras fuentes a fuentes del sistema similares
  const systemFonts: Record<string, string> = {
    merriweather: 'Georgia, "Times New Roman", serif',
    lora: 'Georgia, "Times New Roman", serif',
    literata: 'Georgia, "Times New Roman", serif',
    crimson: 'Georgia, "Times New Roman", serif',
    inter: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sourceSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lato: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    jetbrains: '"Courier New", Consolas, monospace',
  };
  
  return systemFonts[fontName] || 'Georgia, serif';
}

/**
 * Lista de fuentes disponibles
 */
export const availableFonts = Object.keys(fontFiles);
