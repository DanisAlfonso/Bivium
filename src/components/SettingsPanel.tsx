import React, { useState } from 'react';
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
import { FontFamily, ViewMode, TextAlignment, TranslationStyle, NavigationMode, Language } from '../types';
import { fontOptions } from '../constants/fonts';
import { lightTheme, darkTheme } from '../constants/theme';
import { useI18n } from '../i18n';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  viewMode: ViewMode;
  textAlignment: TextAlignment;
  translationStyle: TranslationStyle;
  navigationMode: NavigationMode;
  language: Language;
  onFontFamilyChange: (font: FontFamily) => void;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onTextAlignmentChange: (alignment: TextAlignment) => void;
  onTranslationStyleChange: (style: TranslationStyle) => void;
  onNavigationModeChange: (mode: NavigationMode) => void;
  onLanguageChange: (lang: Language) => void;
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
  navigationMode,
  language,
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  onViewModeChange,
  onTextAlignmentChange,
  onTranslationStyleChange,
  onNavigationModeChange,
  onLanguageChange,
}: SettingsPanelProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { t } = useI18n();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  const isImmersiveMode = viewMode === 'immersive';
  const isParallelMode = viewMode === 'parallel';

  const viewModes = [
    { value: 'parallel' as ViewMode, label: t('settings.viewMode.parallel'), icon: 'layers-outline', desc: t('settings.viewMode.parallelDesc') },
    { value: 'immersive' as ViewMode, label: t('settings.viewMode.immersive'), icon: 'finger-print-outline', desc: t('settings.viewMode.immersiveDesc') },
    { value: 'german-only' as ViewMode, label: t('settings.viewMode.germanOnly'), icon: 'language-outline', desc: t('settings.viewMode.germanOnlyDesc') },
    { value: 'spanish-only' as ViewMode, label: t('settings.viewMode.spanishOnly'), icon: 'text-outline', desc: t('settings.viewMode.spanishOnlyDesc') },
  ];

  const lineHeightOptions = [
    { label: t('settings.lineHeight.compact'), value: 1.4 },
    { label: t('settings.lineHeight.normal'), value: 1.6 },
    { label: t('settings.lineHeight.wide'), value: 1.8 },
    { label: t('settings.lineHeight.generous'), value: 2.0 },
  ];

  const languages = [
    { value: 'es' as Language, code: 'ES', nativeName: 'Español' },
    { value: 'de' as Language, code: 'DE', nativeName: 'Deutsch' },
    { value: 'en' as Language, code: 'EN', nativeName: 'English' },
  ];

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
            <Text style={[styles.headerTitle, { color: theme.text }]}>{t('settings.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Language Selection - Compact */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                <Ionicons name="language-outline" size={14} color={theme.accent} /> {t('settings.language.title')}
              </Text>
              <TouchableOpacity
                style={[styles.languageSelector, { borderColor: theme.border, backgroundColor: 'rgba(0,0,0,0.03)' }]}
                onPress={() => setShowLanguageOptions(!showLanguageOptions)}
              >
                <View style={styles.languageCodeContainer}>
                  <Text style={[styles.languageCode, { color: theme.accent, backgroundColor: theme.accentLight + '30' }]}>
                    {languages.find(l => l.value === language)?.code}
                  </Text>
                </View>
                <Text style={[styles.languageNativeName, { color: theme.text }]}>
                  {languages.find(l => l.value === language)?.nativeName}
                </Text>
                <Ionicons 
                  name={showLanguageOptions ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.textMuted} 
                />
              </TouchableOpacity>
              
              {showLanguageOptions && (
                <View style={[styles.languageDropdown, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  {languages.map((lang) => (
                    <TouchableOpacity
                      key={lang.value}
                      style={[
                        styles.languageOption,
                        language === lang.value && { backgroundColor: theme.accent + '15' },
                      ]}
                      onPress={() => {
                        onLanguageChange(lang.value);
                        setShowLanguageOptions(false);
                      }}
                    >
                      <View style={styles.languageCodeContainer}>
                        <Text 
                          style={[
                            styles.languageCode, 
                            { 
                              color: language === lang.value ? '#fff' : theme.textMuted,
                              backgroundColor: language === lang.value ? theme.accent : theme.surface,
                            }
                          ]}
                        >
                          {lang.code}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.languageOptionText,
                          { color: language === lang.value ? theme.accent : theme.text },
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                      {language === lang.value && (
                        <Ionicons name="checkmark" size={18} color={theme.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* View Mode */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.viewMode.title')}</Text>
              <View style={styles.viewModeGrid}>
                {viewModes.map((mode) => (
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

            {/* Navigation Mode */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.navigation.title')}</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    navigationMode === 'continuous' && { backgroundColor: theme.accent },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => onNavigationModeChange('continuous')}
                >
                  <Ionicons 
                    name="infinite-outline" 
                    size={18} 
                    color={navigationMode === 'continuous' ? '#fff' : theme.text} 
                  />
                  <Text style={[styles.toggleText, { color: navigationMode === 'continuous' ? '#fff' : theme.text }]}>
                    {t('settings.navigation.continuous')}
                  </Text>
                  <Text style={[styles.toggleSubtext, { color: navigationMode === 'continuous' ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                    {t('settings.navigation.continuousDesc')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    navigationMode === 'paginated' && { backgroundColor: theme.accent },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => onNavigationModeChange('paginated')}
                >
                  <Ionicons 
                    name="book-outline" 
                    size={18} 
                    color={navigationMode === 'paginated' ? '#fff' : theme.text} 
                  />
                  <Text style={[styles.toggleText, { color: navigationMode === 'paginated' ? '#fff' : theme.text }]}>
                    {t('settings.navigation.paginated')}
                  </Text>
                  <Text style={[styles.toggleSubtext, { color: navigationMode === 'paginated' ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                    {t('settings.navigation.paginatedDesc')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Translation Style - Solo visible en modo inmersivo */}
            {isImmersiveMode && (
              <View style={[styles.section, styles.highlightedSection, { backgroundColor: theme.highlight }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  <Ionicons name="color-wand-outline" size={14} color={theme.accent} /> {t('settings.translationStyle.title')}
                </Text>
                <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
                  {t('settings.translationStyle.subtitle')}
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
                      {t('settings.translationStyle.inline')}
                    </Text>
                    <Text style={[styles.toggleSubtext, { color: translationStyle === 'inline' ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                      {t('settings.translationStyle.inlineDesc')}
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
                      {t('settings.translationStyle.tooltip')}
                    </Text>
                    <Text style={[styles.toggleSubtext, { color: translationStyle === 'tooltip' ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                      {t('settings.translationStyle.tooltipDesc')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Text Alignment - Oculto en modo Paralelo */}
            {!isParallelMode && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.textAlignment.title')}</Text>
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
                    {t('settings.textAlignment.left')}
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
                    {t('settings.textAlignment.justify')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            )}

            {/* Font Family */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.typography.title')}</Text>
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
                      {font.category === 'serif' ? t('settings.typography.serif') : font.category === 'sans' ? t('settings.typography.sans') : t('settings.typography.mono')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.fontSize.title')}</Text>
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
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.lineHeight.title')}</Text>
              <View style={styles.sizeButtons}>
                {lineHeightOptions.map((option) => (
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
  // Language selector styles - Compact
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  languageDropdown: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  languageOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  languageCodeContainer: {
    marginRight: 10,
  },
  languageCode: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  languageNativeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  // View mode styles
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
