# Segmentation Workflow for Lectio

## Purpose

This document defines the operational workflow for processing German text into segmented JSON files with Spanish translations. It complements `TRANSLATION_GUIDELINES.md` which contains the technical rules and standards.

**Prerequisite**: Read `TRANSLATION_GUIDELINES.md` first to understand:
- Syntactic segmentation rules (Part 1)
- Word-to-word mapping rules (Part 2)  
- Quality check criteria (Part 3)

---

## Core Workflow: Paragraph-by-Paragraph Processing

### Principle
Process **one paragraph at a time**. Do not proceed to the next paragraph until the current one is 100% verified and complete.

---

## Step-by-Step Process

### Step 1: Identify the Paragraph
1. Open the source `.txt` file
2. Locate the paragraph to process (delimited by blank lines)
3. Read the entire paragraph in German once to understand its structure
4. Note the line numbers for reference

### Step 2: Plan Segmentation
1. Identify syntactic boundaries where cuts should be made:
   - After punctuation marking clause boundaries (comma, semicolon)
   - After complete subordinate clauses
   - Between coordinate clauses joined by conjunctions
2. Identify syntactic groups that must stay together:
   - Adjective + noun
   - Verb + objects/complements
   - Preposition + full complement
3. Mentally divide the paragraph into planned segments

### Step 3: Process Each Segment

For each planned segment:

#### 3.1 Extract German Text
1. Copy the German words exactly as they appear in the `.txt` file
2. Verify character-by-character: spelling, capitalization, punctuation
3. Place into the `german` array

#### 3.2 Create Spanish Translation
1. Translate to natural Spanish that makes sense on its own
2. Prioritize meaning and naturalness over literal word order
3. Place into the `spanish` array

#### 3.3 Create Mapping
1. Map each German word index to corresponding Spanish word indices
2. Verify no overlapping indices in Spanish
3. Verify every German word has at least one Spanish mapping
4. Verify every Spanish word has at least one German mapping

### Step 4: Verify the Segment (5-Layer Check)

Before marking a segment complete, verify:

**Layer 1: Source Integrity**
- Does the German text match the `.txt` file exactly?
- Same spelling? Same punctuation? Same capitalization?

**Layer 2: Translation Quality**
- Does the Spanish make grammatical sense alone?
- Does it sound natural (not forced/literal)?
- Does it capture the exact meaning of the German?

**Layer 3: Mapping Correctness (No Overlaps)**
- Are there any overlapping Spanish indices? (CRITICAL ERROR)
- Does every German word have a mapping?
- Does every Spanish word have a mapping?

**Layer 4: Semantic Verification (Word-by-Word)** ⚠️ CRITICAL
For EACH German word, ask: "What does this word mean in the Spanish?"
- Trace word 0 (German) → Which Spanish word(s)? Does it make sense?
- Trace word 1 (German) → Which Spanish word(s)? Does it make sense?
- Continue for ALL words in the segment
- **STOP if any word mapping is unclear** - do not proceed with doubts

**Common errors to catch here:**
- `[]` used incorrectly (word actually has meaning in Spanish)
- Multiple German words mapped to same Spanish word incorrectly
- German modifier not mapped to its corresponding Spanish modifier

**Example of failure:**
```
German: ["so", "spät"]  
Mapping: [{"de": 0, "es": []}, {"de": 1, "es": 0}]
Error: "so" means "tan" and must map to it, not []
```

**Layer 5: Syntactic Completeness**
- Is the segment a complete grammatical unit?
- Does it make sense when read in isolation?
- Would it make sense to a learner reading just this segment?

### Step 5: Add to JSON
Only after all 4 layers pass:
1. Add the segment to the JSON file
2. Assign correct ID format: `ch{X}-p{Y}-s{Z}`
3. Set `isParagraphStart: true` for the first segment of a paragraph

### Step 6: Paragraph Completion Check
After all segments of a paragraph are added:
1. Count total German words in JSON for this paragraph
2. Count German words in the original `.txt` paragraph
3. Verify they match exactly
4. Verify segments flow logically from one to the next

### Step 7: Progress Report
Report completion:  
`Paragraph X (lines Y-Z) completed - N segments - Verified`

Only then proceed to the next paragraph.

---

## ID Convention

Format: `ch1-p3-s12`
- `ch1` = Chapter 1
- `p3` = Paragraph 3 (sequential across entire chapter)
- `s12` = Segment 12 (within the paragraph)

---

## Decision Tree: Where to Cut?

```
Is there punctuation marking a clause boundary (comma, semicolon)?
  └─ YES → Cut after it
  
Is there a complete subordinate clause?
  └─ YES → Cut after it
  
Is there a conjunction joining coordinate clauses (und, aber, oder)?
  └─ YES → Cut before or after (not within the clause)
  
Would cutting split a syntactic group (adj+noun, verb+obj, prep+comp)?
  └─ YES → Do NOT cut here
  
Default: Continue building the current segment
```

---

## Common Pitfalls to Avoid

### Pitfall 1: Rushing to the Next Paragraph
**Problem**: Finding errors later requires re-reading previous text.  
**Solution**: Complete verification of current paragraph before moving on.

### Pitfall 2: Translating Before Segmenting
**Problem**: Natural Spanish word order may hide bad segmentation choices.  
**Solution**: Plan segmentation based on German syntax first, then translate.

### Pitfall 3: Guessing Mappings
**Problem**: Complex reorderings require careful thought.  
**Solution**: Trace each word individually. When in doubt, re-read the original.

### Pitfall 4: Accepting "Almost Correct"
**Problem**: Small errors accumulate across the chapter.  
**Solution**: If any layer of verification fails, fix it immediately. Never proceed with doubts.

---

## Critical Lessons Learned

### Lesson 1: The `[]` Trap
**The Mistake**: Using `[]` for words that DO have meaning in Spanish.

**Example of ERROR:**
```json
{
  "german": ["so", "spät"],
  "spanish": ["tan", "tarde"],
  "mapping": [
    {"de": 0, "es": []},     // ❌ WRONG: "so" = "tan"
    {"de": 1, "es": 1}
  ]
}
```

**Correct:**
```json
{
  "german": ["so", "spät"],
  "spanish": ["tan", "tarde"],
  "mapping": [
    {"de": 0, "es": 0},     // ✅ CORRECT: "so" = "tan"
    {"de": 1, "es": 1}
  ]
}
```

**Rule**: If you can point to a specific Spanish word that carries the meaning, use that index. Only use `[]` when the word is truly absorbed structurally.

### Lesson 2: Semantic Verification is NOT Optional
**The Mistake**: Checking "no overlaps" but not "does each word map correctly?"

**Example of ERROR:**
```json
{
  "german": ["gemäßigt", "und", "richtig", "gestellt"],
  "spanish": ["moderado", "y", "corregido", "de", "manera", "adecuada"],
  "mapping": [
    {"de": 0, "es": 0},           // ✅ "gemäßigt" = "moderado"
    {"de": 1, "es": 1},           // ✅ "und" = "y"
    {"de": 2, "es": []},           // ❌ WRONG: "richtig" = "de manera"
    {"de": 3, "es": [2, 3, 4, 5]} // ❌ WRONG: "gestellt" = "corregido" only
  ]
}
```

**Correct:**
```json
{
  "german": ["gemäßigt", "und", "richtig", "gestellt"],
  "spanish": ["moderado", "y", "corregido", "de", "manera", "adecuada"],
  "mapping": [
    {"de": 0, "es": 0},
    {"de": 1, "es": 1},
    {"de": 2, "es": [3, 4, 5]},    // ✅ "richtig" = "de manera adecuada"
    {"de": 3, "es": 2}             // ✅ "gestellt" = "corregido"
  ]
}
```

**Rule**: After creating mappings, read through: "Word 0 (German) means... Word X (Spanish). Correct?"

### Lesson 3: Superficial Verification = Errors
**The Mistake**: Running a script to check "no overlaps" and declaring it verified.

**Reality**: A segment can have:
- No overlaps ✅
- All words mapped ✅
- Still be WRONG ❌

**The only verification that matters**: Reading each German word and confirming it maps to the correct Spanish word semantically.

---

## Progress Tracking

Recommended reporting format after each paragraph:
```
Paragraph 10 (lines 190-229): 55 segments
- German words: 247 / 247 ✅
- All mappings verified: ✅
- No overlapping indices: ✅
- Natural translations: ✅
Status: COMPLETE
```

---

## Workflow Summary

1. **Read** one paragraph from `.txt`
2. **Plan** where to cut (syntactic boundaries)
3. **Process** each segment:
   - Extract German (exact copy)
   - Translate (natural Spanish)
   - Map (no overlaps, all words covered)
4. **Verify** 5 layers before adding to JSON
5. **Check** paragraph completeness (word count)
6. **Report** progress
7. **Repeat** from step 1 for next paragraph

---

## Key Reminders

- **Never process more than one paragraph at a time**
- **Never proceed with unverified segments**
- **When in doubt, stop and re-check**
- **Quality over speed - one perfect paragraph is better than ten flawed ones**

---

## Using Subagents (For Large Chapters)

### When to Use Subagents

For chapters exceeding 2000 words (e.g., Chapter 3 with ~9000 words), subagents may be used to accelerate processing. However, strict protocols must be followed.

**Rule**: The main agent retains full responsibility for final quality. Subagents assist with processing; they do not replace verification.

### Subagent Protocol

#### 1. Task Delegation
When delegating to a subagent, provide:
- Exact German text for ONE paragraph only
- Explicit instructions referencing `TRANSLATION_GUIDELINES.md`
- Examples of correct vs incorrect mappings
- Prohibition list: no overlapping indices, no omitted words, no literal translations

#### 2. Subagent Instructions Template
```
Task: Segment the following German paragraph into JSON format.

German text: [exact text from .txt]

Requirements:
1. Segment at syntactic boundaries only
2. Spanish must be natural, not literal
3. Mappings must have NO overlapping indices
4. Every German word must map to Spanish word(s)
5. Every Spanish word must map to German word(s)
6. Verify German text matches source exactly

Return format:
For each segment provide:
- german: array
- spanish: array  
- mapping: array with indices

Example of CORRECT mapping:
{"de": 0, "es": 0}
{"de": 1, "es": [1, 2]}

Example of INCORRECT mapping (overlapping):
{"de": 0, "es": [0, 1]}
{"de": 1, "es": [0, 1]} <- Index 0 and 1 used twice!
```

#### 3. Verification of Subagent Output
**NEVER accept subagent output without verification.**

For each segment received from subagent:
1. **Verify German text**: Character-by-character against source
2. **Verify Spanish**: Does it sound natural? Is the meaning correct?
3. **Verify mappings**: Check for overlapping indices manually
4. **Verify completeness**: Every word has mapping?
5. **Apply 4-layer check** from main workflow

If any verification fails:
- Correct the segment yourself
- OR return to subagent with specific error explanation
- OR discard and reprocess the paragraph

#### 4. Responsibility
- Subagent errors are the main agent's fault for insufficient instructions or inadequate verification
- Final JSON quality is the main agent's responsibility
- When in doubt, process manually rather than risk errors

#### 5. Recommended Usage
- First 2-3 paragraphs: Process manually to establish pattern
- Subsequent paragraphs: May use subagent with verification
- Complex syntactic structures: Always process manually
- Final 2-3 paragraphs: Process manually to ensure clean ending

### Decision Tree: Use Subagent?
```
Is the chapter > 2000 words?
  └─ NO → Process manually
  └─ YES → Consider subagent
      └─ Is this the first paragraph?
          └─ YES → Process manually (establish baseline)
          └─ NO → May use subagent
              └─ Is the syntax complex (multiple subordinates)?
                  └─ YES → Process manually
                  └─ NO → Use subagent with full verification
```

---

## Reference

For detailed technical specifications, see:
- `TRANSLATION_GUIDELINES.md` - Rules for segmentation, translation, and mapping
- `chapter1.txt` - Example source text format
- `chapter-1.json` - Example output format
