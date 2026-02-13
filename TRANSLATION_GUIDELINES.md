# Translation and Segmentation Guidelines for Lectio

## Overview

This document defines the standards for creating bilingual text segments with precise word-to-word mappings between German and Spanish for the Lectio app.

---

## Part 1: Syntactic Segmentation

### Core Principle
**Segment at syntactic boundaries, never in the middle of a syntactic unit.**

A segment must form a **complete grammatical unit** that makes sense on its own. Do not split adjectives from their nouns, verbs from their objects, or break apart any syntactic group.

### 1.1 Syntactic Unit Integrity (CRITICAL)
**Never separate elements that form a syntactic unit:**

❌ **INCORRECT** - Split adjective from noun:
```json
{ "german": ["monatelang", "eine", "so", "gefahrdrohende"], "spanish": ["durante", "meses", "una", "tan", "amenazante"] }
{ "german": ["Miene", "zeigte,"], "spanish": ["faz", "mostraba,"] }
```

✅ **CORRECT** - Keep syntactic unit together:
```json
{ "german": ["monatelang", "eine", "so", "gefahrdrohende", "Miene", "zeigte,"], "spanish": ["durante", "meses", "una", "tan", "amenazante", "faz", "mostraba,"] }
```

### 1.2 Where to Cut
Cut at these natural boundaries:

- **After punctuation** that marks clause boundaries (comma, semicolon, colon)
- **After complete subordinate clauses**
- **After parenthetical/incidental phrases**
- **At subject transitions** when the sentence structure changes
- **Between coordinate clauses** joined by conjunctions like "und", "aber", "denn"

### 1.3 Keep Together (Syntactic Groups)

**Adjective + Noun:**
```json
{ "german": ["der", "geduldige", "Künstler"], "spanish": ["el", "paciente", "artista"] }
{ "german": ["eine", "so", "gefahrdrohende", "Miene"], "spanish": ["una", "tan", "amenazante", "faz"] }
```

**Verb + Objects/Complements:**
```json
{ "german": ["einen", "Spaziergang", "unternommen"], "spanish": ["un", "paseo", "emprendió"] }
{ "german": ["das", "Freie", "gesucht"], "spanish": ["buscó", "el", "aire", "libre"] }
```

**Preposition + Full Complement:**
```json
{ "german": ["von", "seiner", "Wohnung"], "spanish": ["desde", "su", "vivienda"] }
{ "german": ["in", "der", "Prinzregentenstraße"], "spanish": ["en", "la", "Prinzregentenstraße"] }
```

**Relative clauses (can be long but keep together):**
```json
{ "german": ["der", "in", "langem", "Fleiß", "den", "figurenreichen"], "spanish": ["que", "con", "largo", "esfuerzo", "el", "figurativo"] }
```

### 1.4 Segment Length
There is **no fixed word limit**. A segment can be:
- **1 word**: Standalone proper nouns, complete verbs, interjections
- **3-6 words**: Standard syntactic units
- **8-12 words**: Complex subordinate clauses that form a complete unit

The guiding principle is **grammatical completeness**, not word count.

---

## Part 2: Word-to-Word Mapping (CRITICAL)

### 2.1 Core Mapping Principle
**Every word must have a correct, verifiable mapping to its corresponding word(s) in the target language.**

The `mapping` array defines how words in German correspond to words in Spanish using 0-based indices.

### 2.2 Basic Mapping Rules

#### One-to-One Mapping
When words correspond directly:
```json
{
  "german": ["Der", "Englische", "Garten,"],
  "spanish": ["El", "Jardín", "Inglés,"],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 2},
    {"de": 2, "es": 1}
  ]
}
```

#### One-to-Many Mapping
When one German word translates to multiple Spanish words:
```json
{
  "german": ["Beim", "Aumeister,"],
  "spanish": ["En", "el", "Aumeister,"],
  "mapping": [
    {"de": 0, "es": [0, 1]},
    {"de": 1, "es": 2}
  ]
}
```

#### Many-to-One Mapping
When multiple German words translate to one Spanish word:
```json
{
  "german": ["ein", "falscher", "Hochsommer", "eingefallen."],
  "spanish": ["un", "falso", "verano", "había", "llegado."],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 1},
    {"de": 2, "es": 2},
    {"de": 3, "es": [3, 4]}
  ]
}
```

### 2.3 Critical Mapping Requirements

#### ✅ CORRECT Mappings

**Word order differences:**
```json
{
  "german": ["hatte", "Aschenbach", "überblickt,"],
  "spanish": ["había", "contemplado", "Aschenbach,"],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 2},
    {"de": 2, "es": 1}
  ]
}
```

**Verbal periphrases:**
```json
{
  "german": ["hatte", "genommen"],
  "spanish": ["había", "tomado"],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 1}
  ]
}
```

#### ❌ INCORRECT Mappings

**Overlapping indices (NEVER do this):**
```json
{
  "german": ["einen", "Mann", "bemerkte,"],
  "spanish": ["notó", "a", "un", "hombre,"],
  "mapping": [
    {"de": 0, "es": [0, 1, 2]},  // ❌ WRONG: overlaps with index 2
    {"de": 1, "es": 3},
    {"de": 2, "es": [0, 1, 2]}   // ❌ WRONG: overlaps with index 0
  ]
}
```

**Correct version:**
```json
{
  "german": ["einen", "Mann", "bemerkte,"],
  "spanish": ["notó", "a", "un", "hombre,"],
  "mapping": [
    {"de": 0, "es": [1, 2]},
    {"de": 1, "es": 3},
    {"de": 2, "es": 0}
  ]
}
```

**Missing mappings:**
Every German word MUST have at least one Spanish index mapped to it, and vice versa.

### 2.4 Complex Mapping Scenarios

#### Separable Verbs (German)
```json
{
  "german": ["weist", "überdies", "...", "auf,"],
  "spanish": ["muestra", "además", "...", ""],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 1},
    {"de": 7, "es": 0}
  ]
}
```

#### Subordinate Clauses with Word Reordering
```json
{
  "german": ["die", "ihn", "zurückbringen", "sollte."],
  "spanish": ["que", "lo", "llevase", "de", "regreso"],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 1},
    {"de": 2, "es": [2, 3, 4]},
    {"de": 3, "es": [2, 3, 4]}
  ]
}
```

### 2.5 Empty Arrays for Missing Words
`[]` is allowed in Spanish when a German word has no direct translation in that context.
Example: `["aus", "allein"]` → `["alone"]` ("aus" is integrated into the Spanish construction)

---

## Part 3: Quality Check

Before considering a segment as valid, verify:

1. Does it contain a **complete syntactic unit** (not a fragment)? ✅
2. Does it make sense on its own in German? ✅
3. Does it make sense on its own in Spanish? ✅
4. Does the translation correspond exactly to the German? ✅
5. When joined with previous and next, does it flow correctly? ✅
6. Did I cut **between** syntactic groups, not **within** one? ✅
7. **Are ALL mappings correct and non-overlapping?** ✅
8. **Does every German word map to at least one Spanish word?** ✅
9. **Does every Spanish word map to at least one German word?** ✅

---

## Part 4: Exception Rules

### May stand alone:
- **Proper nouns**: `["Aschenbach"]`
- **Complete standalone nouns**: `["Spaziergang"]` → `["paseo"]`
- **Complete standalone verbs**: `["wob"]` (wove) → `["tejió"]`
- **Interjections**: `["Ach!"]` → `["Oh!"]`
- **Short direct speech**: `["Ja,"]` → `["Sí,"]`
- **List items** (when clearly enumerated): `["Behutsamkeit,"]`

### Should NOT stand alone:
- **Auxiliary verbs without context**: ❌ `["hatte"]`
- **Prepositions without complements**: ❌ `["an"]`
- **Articles alone**: ❌ `["das"]`
- **Adjectives without nouns**: ❌ `["gefahrdrohende"]`
- **Subordinating conjunctions alone**: ❌ `["dass"]`

---

## Part 5: Examples

### Nouns and proper nouns (can stand alone):
```json
{ "german": ["Gustav", "Aschenbach"], "spanish": ["Gustav", "Aschenbach"] }
{ "german": ["Spaziergang"], "spanish": ["paseo"] }
```

### Complete verb phrases:
```json
{ "german": ["hatte", "an", "einem", "Frühlingsnachmittag", "einen", "Spaziergang", "unternommen"], "spanish": ["había", "en", "una", "tarde", "primaveral", "un", "paseo", "emprendido"] }
```

### Subordinate clauses:
```json
{ "german": ["wie", "seit", "seinem", "fünfzigsten", "Geburtstag", "amtlich", "sein", "Name", "lautete"], "spanish": ["pues", "desde", "su", "quincuagésimo", "cumpleaños", "oficialmente", "su", "nombre", "era"] }
```

### Lists of adjectives:
```json
{ "german": ["Behutsamkeit,"], "spanish": ["prudencia,"] }
{ "german": ["Umsicht,"], "spanish": ["circunspección,"] }
{ "german": ["Eindringlichkeit"], "spanish": ["intensidad"] }
```

---

## Part 6: Note for the Editor

This app is for **practicing German reading at intermediate level**. Segmentation should facilitate:
- Understanding of **German syntactic structure**
- Vocabulary learning in **meaningful grammatical context**
- Natural reading flow without excessive fragmentation
- Immediate and accurate translation of each **complete unit**
- **Precise word-to-word correspondence** through accurate mappings

**Priority**: Grammatical coherence over arbitrary word limits. Never split a syntactic group just to meet a word count.

**CRITICAL**: Always verify mappings manually. Incorrect mappings break the learning experience.
