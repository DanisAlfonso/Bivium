import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily, ViewMode, TextAlignment, TranslationStyle } from '../types';
import { fontOptions } from '../constants/fonts';
import { lightTheme, darkTheme } from '../constants/theme';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  viewMode: ViewMode;
  textAlignment: TextAlignment;
  translationStyle: TranslationStyle;
  onFontFamilyChange: (font: FontFamily) => void;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onTextAlignmentChange: (alignment: TextAlignment) => void;
  onTranslationStyleChange: (style: TranslationStyle) => void;
}

export function SettingsPanel({
  visible,
  onClose,
  fontFamily,
  fontSize,
  lineHeight,
  viewMode,
  textAlignment,
  translationStyle,
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  onViewModeChange,
  onTextAlignmentChange,
  onTranslationStyleChange,
}: SettingsPanelProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const isImmersiveMode = viewMode === 'immersive';
  const isParallelMode = viewMode === 'parallel';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: theme.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Ajustes de lectura</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* View Mode */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Modo de vista</Text>
              <View style={styles.viewModeGrid}>
                {[
                  { value: 'parallel' as ViewMode, label: 'Paralelo', icon: 'layers-outline', desc: 'Alemán + español' },
                  { value: 'immersive' as ViewMode, label: 'Inmersivo', icon: 'finger-print-outline', desc: 'Tap para revelar' },
                  { value: 'german-only' as ViewMode, label: 'Solo alemán', icon: 'language-outline', desc: 'Texto original' },
                  { value: 'spanish-only' as ViewMode, label: 'Solo español', icon: 'text-outline', desc: 'Traducción' },
                ].map((mode) => (
                  <TouchableOpacity
                    key={mode.value}
                    style={[
                      styles.viewModeButton,
                      viewMode === mode.value && { 
                        backgroundColor: theme.accent,
                        borderColor: theme.accent,
                      },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => onViewModeChange(mode.value)}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={22}
                      color={viewMode === mode.value ? '#fff' : theme.text}
                    />
                    <Text
                      style={[
                        styles.viewModeText,
                        { color: viewMode === mode.value ? '#fff' : theme.text },
                      ]}
                    >
                      {mode.label}
                    </Text>
                    <Text
                      style={[
                        styles.viewModeDesc,
                        { color: viewMode === mode.value ? 'rgba(255,255,255,0.8)' : theme.textMuted },
                      ]}
                    >
                      {mode.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Translation Style - Solo visible en modo inmersivo */}
            {isImmersiveMode && (
              <View style={[styles.section, styles.highlightedSection, { backgroundColor: theme.highlight }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  <Ionicons name="color-wand-outline" size={14} color={theme.accent} /> Estilo de traducción
                </Text>
                <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
                  ¿Cómo mostrar la traducción?
                </Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      translationStyle === 'inline' && { backgroundColor: theme.accent },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => onTranslationStyleChange('inline')}
                  >
                    <Ionicons 
                      name="list-outline" 
                      size={18} 
                      color={translationStyle === 'inline' ? '#fff' : theme.text} 
                    />
                    <Text style={[styles.toggleText, { color: translationStyle === 'inline' ? '#fff' : theme.text }]}>
                      Inline
                    </Text>
                    <Text style={[styles.toggleSubtext, { color: translationStyle === 'inline' ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                      Debajo del texto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      translationStyle === 'tooltip' && { backgroundColor: theme.accent },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => onTranslationStyleChange('tooltip')}
                  >
                    <Ionicons 
                      name="chatbubble-outline" 
                      size={18} 
                      color={translationStyle === 'tooltip' ? '#fff' : theme.text} 
                    />
                    <Text style={[styles.toggleText, { color: translationStyle === 'tooltip' ? '#fff' : theme.text }]}>
                      Tooltip
                    </Text>
                    <Text style={[styles.toggleSubtext, { color: translationStyle === 'tooltip' ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                      Carta flotante
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Text Alignment - Oculto en modo Paralelo */}
            {!isParallelMode && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Alineación del texto</Text>
              <View style={styles.alignmentContainer}>
                <TouchableOpacity
                  style={[
                    styles.alignmentButton,
                    textAlignment === 'left' && { backgroundColor: theme.accent },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => onTextAlignmentChange('left')}
                >
                  <View style={styles.alignmentIcon}>
                    <View style={[styles.line, { backgroundColor: textAlignment === 'left' ? '#fff' : theme.text, width: 24 }]} />
                    <View style={[styles.line, { backgroundColor: textAlignment === 'left' ? '#fff' : theme.text, width: 18 }]} />
                    <View style={[styles.line, { backgroundColor: textAlignment === 'left' ? '#fff' : theme.text, width: 22 }]} />
                    <View style={[styles.line, { backgroundColor: textAlignment === 'left' ? '#fff' : theme.text, width: 16 }]} />
                  </View>
                  <Text style={[styles.alignmentText, { color: textAlignment === 'left' ? '#fff' : theme.text }]}>
                    Izquierda
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.alignmentButton,
                    textAlignment === 'justify' && { backgroundColor: theme.accent },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => onTextAlignmentChange('justify')}
                >
                  <View style={styles.alignmentIcon}>
                    <View style={[styles.line, { backgroundColor: textAlignment === 'justify' ? '#fff' : theme.text, width: 24 }]} />
                    <View style={[styles.line, { backgroundColor: textAlignment === 'justify' ? '#fff' : theme.text, width: 24 }]} />
                    <View style={[styles.line, { backgroundColor: textAlignment === 'justify' ? '#fff' : theme.text, width: 24 }]} />
                    <View style={[styles.line, { backgroundColor: textAlignment === 'justify' ? '#fff' : theme.text, width: 24 }]} />
                  </View>
                  <Text style={[styles.alignmentText, { color: textAlignment === 'justify' ? '#fff' : theme.text }]}>
                    Justificado
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            )}

            {/* Font Family */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Tipografía</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fontScroll}
              >
                {fontOptions.map((font) => (
                  <TouchableOpacity
                    key={font.value}
                    style={[
                      styles.fontButton,
                      fontFamily === font.value && { 
                        backgroundColor: theme.accent,
                        borderColor: theme.accent,
                      },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => onFontFamilyChange(font.value)}
                  >
                    <Text
                      style={[
                        styles.fontButtonText,
                        { 
                          color: fontFamily === font.value ? '#fff' : theme.text,
                          fontFamily: font.family.split(',')[0],
                        },
                      ]}
                    >
                      {font.displayName}
                    </Text>
                    <Text
                      style={[
                        styles.fontCategory,
                        { 
                          color: fontFamily === font.value ? 'rgba(255,255,255,0.7)' : theme.textMuted,
                        },
                      ]}
                    >
                      {font.category === 'serif' ? 'Serif' : font.category === 'sans' ? 'Sans' : 'Mono'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Tamaño de texto</Text>
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: theme.textMuted }]}>A</Text>
                <View style={styles.sizeButtons}>
                  {[14, 16, 18, 20, 22, 24].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        fontSize === size && { backgroundColor: theme.accent },
                        { borderColor: theme.border },
                      ]}
                      onPress={() => onFontSizeChange(size)}
                    >
                      <Text
                        style={[
                          styles.sizeButtonText,
                          { color: fontSize === size ? '#fff' : theme.text },
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.sliderLabel, { color: theme.textMuted, fontSize: 20 }]}>A</Text>
              </View>
            </View>

            {/* Line Height */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Interlineado</Text>
              <View style={styles.sizeButtons}>
                {[{ label: 'Compacto', value: 1.4 }, { label: 'Normal', value: 1.6 }, { label: 'Amplio', value: 1.8 }, { label: 'Generoso', value: 2.0 }].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.lineHeightButton,
                      Math.abs(lineHeight - option.value) < 0.05 && { backgroundColor: theme.accent },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => onLineHeightChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.lineHeightText,
                        { color: Math.abs(lineHeight - option.value) < 0.05 ? '#fff' : theme.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  highlightedSection: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: -4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
  },
  viewModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  viewModeButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  viewModeDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  toggleSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  alignmentContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  alignmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  alignmentIcon: {
    gap: 3,
  },
  line: {
    height: 2,
    borderRadius: 1,
  },
  alignmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fontScroll: {
    flexGrow: 0,
  },
  fontButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  fontButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  fontCategory: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sizeButtons: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    minWidth: 50,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lineHeightButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  lineHeightText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
