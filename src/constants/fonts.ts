import { FontOption } from '../types';

export const fontOptions: FontOption[] = [
  // Serif - Cálidas y literarias
  { value: 'merriweather', displayName: 'Merriweather', family: 'Merriweather_400Regular, Merriweather_700Bold', category: 'serif' },
  { value: 'lora', displayName: 'Lora', family: 'Lora_400Regular, Lora_500Medium, Lora_600SemiBold, Lora_700Bold', category: 'serif' },
  { value: 'literata', displayName: 'Literata', family: 'Literata_400Regular, Literata_500Medium, Literata_600SemiBold, Literata_700Bold', category: 'serif' },
  { value: 'crimson', displayName: 'Crimson Pro', family: 'CrimsonPro_400Regular, CrimsonPro_500Medium, CrimsonPro_600SemiBold, CrimsonPro_700Bold', category: 'serif' },
  // Sans - Modernas y limpias
  { value: 'inter', displayName: 'Inter', family: 'Inter_400Regular, Inter_500Medium, Inter_600SemiBold', category: 'sans' },
  { value: 'sourceSans', displayName: 'Source Sans 3', family: 'SourceSans3_400Regular, SourceSans3_500Medium, SourceSans3_600SemiBold', category: 'sans' },
  { value: 'lato', displayName: 'Lato', family: 'Lato_400Regular, Lato_700Bold', category: 'sans' },
  // Monospace - Técnica
  { value: 'jetbrains', displayName: 'JetBrains Mono', family: 'JetBrainsMono_400Regular, JetBrainsMono_500Medium', category: 'mono' },
];

export const defaultFont = fontOptions[1]; // Lora
