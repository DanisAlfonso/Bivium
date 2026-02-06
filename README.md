# Bivium

Ein bilinguale Lese-App für literarische Klassiker, entwickelt mit Expo und React Native.

## Features

### Leseerlebnisse

- **Parallel**: Deutsch-spanischer Text synchron segmentiert
- **Immersiv**: Tippen zum Aufdecken von Übersetzungen
  - **Inline-Stil**: Übersetzung unter dem Text
  - **Tooltip-Stil**: Schwebende Karte über dem Segment
  - Nur eine Übersetzung gleichzeitig sichtbar
  - Header auto-hide für klare Leseführung
- **Nur Deutsch**: Originaltext
- **Nur Spanisch**: Vollständige Übersetzung

### Anpassung

- **8 Schriftarten**: Merriweather, Lora, Literata, Crimson Pro, Inter, Source Sans 3, Lato, JetBrains Mono
- **Ausrichtung**: Links oder Blocksatz
- **Größe**: 14-24px
- **Zeilenabstand**: Kompakt, Normal, Breit, Großzügig
- **Thema**: Hell/Dunkel (automatisch)

### Fortschrittsspeicherung

- Automatische Speicherung alle 5 Segmente
- Speicherung beim Verlassen der App
- Wiederherstellung der Leseposition beim Öffnen
- Fortschrittsanzeige in der Bibliothek

### Immersiver Modus

- **Perfekte Blocksatz** via WebView mit HTML/CSS
- **Klickbare Segmente**: Tippe 3-5 Wörter zum Übersetzen
- **Intelligente Tooltips**: 
  - Automatische Positionsanpassung (oben/unten/links/rechts)
  - Keine abgeschnittenen Tooltips mehr
- **Doppeltippen**: Zeigt/verbirgt den Header

## Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- WebView für immersiven Modus
- AsyncStorage für Fortschritt

## Struktur

```
app/
  _layout.tsx          # Root mit Schriftarten
  index.tsx            # Bibliothek (auf Deutsch)
  reader.tsx           # Leser
src/
  components/
    BilingualReader.tsx
    Paragraph.tsx      # WebView mit HTML/CSS
    ReaderHeader.tsx
    SettingsPanel.tsx
  hooks/
    useSettings.ts
    useProgress.ts
  data/
    tod-in-venedig-ch1.ts
```

## Entwicklung

```bash
cd /Users/danny/projects/expo/bivium
npm start
```

## Roadmap

- [x] Immersiver Modus mit Blocksatz
- [x] Tooltip/Inline Übersetzungsstile
- [x] Header auto-hide
- [x] Intelligente Tooltip-Positionierung
- [x] Fortschrittsspeicherung
- [x] Bibliothek auf Deutsch
- [ ] Integriertes Wörterbuch
- [ ] Synchronisierte Audio
- [ ] Weitere literarische Werke
