# Segmentation Rules for Lectio

## Core Principle
**Segment at syntactic boundaries, never in the middle of a syntactic unit.**

A segment must form a **complete grammatical unit** that makes sense on its own. Do not split adjectives from their nouns, verbs from their objects, or break apart any syntactic group.

---

## Fundamental Rules

### 1. Syntactic Unit Integrity (CRITICAL)
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

### 2. Where to Cut
Cut at these natural boundaries:

- **After punctuation** that marks clause boundaries (comma, semicolon, colon)
- **After complete subordinate clauses**
- **After parenthetical/incidental phrases**
- **At subject transitions** when the sentence structure changes
- **Between coordinate clauses** joined by conjunctions like "und", "aber", "denn"

### 3. Keep Together (Syntactic Groups)

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

### 4. Exact and Coherent Translation
- Spanish must correspond **word-for-word** to the German segment
- Each translation must have **its own grammatical meaning**
- When word order differs between languages, segment so each unit has correspondence

### 5. Segment Length
There is **no fixed word limit**. A segment can be:
- **1 word**: Standalone proper nouns, complete verbs, interjections
- **3-6 words**: Standard syntactic units
- **8-12 words**: Complex subordinate clauses that form a complete unit

The guiding principle is **grammatical completeness**, not word count.

### 6. Empty Arrays (Missing Words)
`[]` is allowed in Spanish when a German word has no direct translation in that context.
Example: `["aus", "allein"]` → `["alone"]` ("aus" is integrated into the Spanish construction)

---

## Correct Examples

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

## Quality Check

Before considering a segment as valid, verify:
1. Does it contain a **complete syntactic unit** (not a fragment)? ✅
2. Does it make sense on its own in German? ✅
3. Does it make sense on its own in Spanish? ✅
4. Does the translation correspond exactly to the German? ✅
5. When joined with previous and next, does it flow correctly? ✅
6. Did I cut **between** syntactic groups, not **within** one? ✅

---

## Exception Rules

May stand alone:
- **Proper nouns**: `["Aschenbach"]`
- **Complete standalone nouns**: `["Spaziergang"]` → `["paseo"]`
- **Complete standalone verbs**: `["wob"]` (wove) → `["tejió"]`
- **Interjections**: `["Ach!"]` → `["Oh!"]`
- **Short direct speech**: `["Ja,"]` → `["Sí,"]`
- **List items** (when clearly enumerated): `["Behutsamkeit,"]`

Should NOT stand alone:
- **Auxiliary verbs without context**: ❌ `["hatte"]`
- **Prepositions without complements**: ❌ `["an"]`
- **Articles alone**: ❌ `["das"]`
- **Adjectives without nouns**: ❌ `["gefahrdrohende"]`
- **Subordinating conjunctions alone**: ❌ `["dass"]`

---

## Note for the Editor

This app is for **practicing German reading at intermediate level**. Segmentation should facilitate:
- Understanding of **German syntactic structure**
- Vocabulary learning in **meaningful grammatical context**
- Natural reading flow without excessive fragmentation
- Immediate and accurate translation of each **complete unit**

**Priority**: Grammatical coherence over arbitrary word limits. Never split a syntactic group just to meet a word count.
