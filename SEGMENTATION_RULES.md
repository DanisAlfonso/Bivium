# Segmentation Rules for Lectio

## Target Level
This app is designed for German language learners at **upper-beginner to intermediate** level (B1-B2). Segments should be informative enough for this level—neither too fragmented nor too long.

## Fundamental Principles

### 1. Segment Size
- **Maximum 5 words** per segment
- **Minimum 2-3 words** for functional words (articles, prepositions, pronouns, auxiliary verbs)
- Single word only if it's a noun or verb with complete meaning by itself

### 2. Avoid Isolated Functional Word Segments
❌ **INCORRECT** for intermediate level:
```json
{ "german": ["hatte"], "spanish": ["había"] }
{ "german": ["das"], "spanish": ["que"] }
{ "german": ["an"], "spanish": ["en"] }
```

✅ **CORRECT** - Combine with context:
```json
{ "german": ["hatte", "an", "einem", "Frühlingsnachmittag"], "spanish": ["había", "en", "una", "tarde", "primaveral"] }
{ "german": ["das", "unserem", "Kontinent"], "spanish": ["que", "a", "nuestro", "continente"] }
```

### 3. Unit of Meaning
- Each segment must have **complete meaning on its own**
- It should be a logical text unit that can be understood independently
- Example: `["amtlich", "sein", "Name", "lautete,"]` → `["officially", "his", "name", "was,"]`

### 4. Exact and Coherent Translation
- Spanish must correspond **word-for-word** (or phrase-for-phrase) to the German segment
- Each translation must have **its own grammatical meaning**
- Correct example: `["Miene", "zeigte,"]` → `["expression", "showed,"]`

### 5. Coherence in Combination
- When joining consecutive segments, the Spanish should **flow correctly**
- Word order may change between languages, but meaning must be maintained

### 6. Empty Arrays (Missing Words)
- `[]` is allowed in Spanish when a German word has no direct translation in that context
- Example: `["aus", "allein"]` → `["alone"]` ("aus" is integrated into the Spanish construction)

### 7. Punctuation
- Punctuation should align with the **meaning** of the sentence
- Commas, periods, and other marks should go where they belong in each language
- Example: `["zeigte,"]` → `["showed,"]` (comma is preserved)

### 8. Segmentation by Word Order
- When word order differs between German and Spanish, segment so each unit has correspondence
- Example: `"zu München aus allein"` is segmented as `["zu", "München"]`, `["aus", "allein"]` → `["from", "Munich"]`, `["alone"]`

## Correct Examples

### Nouns and proper nouns (can stand alone):
```json
{ "german": ["Gustav", "Aschenbach"], "spanish": ["Gustav", "Aschenbach"] }
{ "german": ["Miene"], "spanish": ["expression"] }
{ "german": ["Spaziergang"], "spanish": ["walk"] }
```

### Verbs and auxiliaries (always with context):
```json
{ "german": ["hatte", "an", "einem", "Frühlingsnachmittag"], "spanish": ["had", "on", "a", "spring", "afternoon"] }
{ "german": ["monatelang", "eine", "so", "gefahrdrohende"], "spanish": ["for", "months", "such", "a", "threatening"] }
{ "german": ["zeigte,"], "spanish": ["showed,"] }
```

### Prepositions and articles (with nouns):
```json
{ "german": ["von", "seiner", "Wohnung"], "spanish": ["from", "his", "residence"] }
{ "german": ["in", "der", "Prinzregentenstraße"], "spanish": ["on", "the", "Prinzregentenstraße"] }
{ "german": ["des", "Jahres"], "spanish": ["of", "the", "year"] }
```

## Quality Check

Before considering a segment as valid, verify:
1. Does it have enough words (minimum 2-3 if functional)? ✅
2. Does it make sense on its own in German? ✅
3. Does it make sense on its own in Spanish? ✅
4. Does the translation correspond exactly to the German? ✅
5. When joined with previous and next, does it flow correctly? ✅
6. Does it not exceed 5 words? ✅

## Exception Rules

May stand alone:
- **Proper nouns**: `["Aschenbach"]`
- **Concrete nouns**: `["Spaziergang"]` → `["walk"]`
- **Interjections**: `["Ach!"]` → `["Oh!"]`
- **Short direct speech**: `["Ja,"]` → `["Yes,"]`

Should NOT stand alone:
- **Auxiliary verbs**: ❌ `["hatte"]` → `["had"]`
- **Prepositions**: ❌ `["an"]` → `["on"]`
- **Articles**: ❌ `["das"]` → `["the/that"]`
- **Pronouns**: ❌ `["ihm"]` → `["him"]`
- **Conjunctions**: ❌ `["dass"]` → `["that"]`

## Note for the Editor

This app is for **practicing German reading at intermediate level**. Segmentation should facilitate:
- Gradual text comprehension without excessive fragmentation
- Vocabulary learning in meaningful context
- Understanding of German grammatical structure
- Immediate and accurate translation of each unit

**Priority**: Balance between granularity and context. The intermediate learner needs to see functional words IN CONTEXT, not isolated.
