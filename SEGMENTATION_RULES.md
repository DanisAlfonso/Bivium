# Reglas de Segmentación para Lectio

## Nivel Objetivo
Esta app está diseñada para estudiantes de alemán con nivel **principiante-avanzado a intermedio** (B1-B2). Los segmentos deben ser lo suficientemente informativos para este nivel, sin ser ni demasiado fragmentados ni demasiado largos.

## Principios Fundamentales

### 1. Tamaño de Segmentos
- **Máximo 5 palabras** por segmento
- **Mínimo 2-3 palabras** para palabras funcionales (artículos, preposiciones, pronombres, verbos auxiliares)
- Una sola palabra solo si es un sustantivo o verbo con significado completo por sí mismo

### 2. Evitar Segmentos Aislados de Palabras Funcionales
❌ **INCORRECTO** para nivel intermedio:
```json
{ "german": ["hatte"], "spanish": ["había"] }
{ "german": ["das"], "spanish": ["que"] }
{ "german": ["an"], "spanish": ["en"] }
```

✅ **CORRECTO** - Combinar con contexto:
```json
{ "german": ["hatte", "an", "einem", "Frühlingsnachmittag"], "spanish": ["había", "en", "una", "tarde", "primaveral"] }
{ "german": ["das", "unserem", "Kontinent"], "spanish": ["que", "a", "nuestro", "continente"] }
```

### 3. Unidad de Significado
- Cada segmento debe tener **sentido completo por sí solo**
- Debe ser una unidad lógica de texto que se pueda entender independientemente
- Ejemplo: `["amtlich", "sein", "Name", "lautete,"]` → `["oficialmente", "su", "nombre", "era,"]`

### 4. Traducción Exacta y Coherente
- El español debe corresponder **palabra por palabra** (o frase por frase) al alemán del segmento
- Cada traducción debe tener **sentido gramatical propio**
- Ejemplo correcto: `["Miene", "zeigte,"]` → `["faz", "mostraba,"]`

### 5. Coherencia en Combinación
- Al unir segmentos consecutivos, el español debe **fluir correctamente**
- El orden puede cambiar entre idiomas, pero el significado debe mantenerse

### 6. Palabras Vacías (Empty Arrays)
- Se permite `[]` en español cuando una palabra alemana no tiene traducción directa en ese contexto
- Ejemplo: `["aus", "allein"]` → `["solo"]` ("aus" se integra en la construcción española)

### 7. Puntuación
- La puntuación debe alinearse con el **sentido** de la frase
- Comas, puntos y otros signos deben ir donde corresponda en cada idioma
- Ejemplo: `["zeigte,"]` → `["mostraba,"]` (la coma se mantiene)

### 8. Segmentación por Orden
- Cuando el orden difiere entre alemán y español, segmentar de forma que cada unidad tenga correspondencia
- Ejemplo: `"zu München aus allein"` se segmenta como `["zu", "München"]`, `["aus", "allein"]` → `["de", "Múnich"]`, `["solo"]`

## Ejemplos Correctos

### Sustantivos y nombres propios (pueden ir solos):
```json
{ "german": ["Gustav", "Aschenbach"], "spanish": ["Gustav", "Aschenbach"] }
{ "german": ["Miene"], "spanish": ["faz"] }
{ "german": ["Spaziergang"], "spanish": ["paseo"] }
```

### Verbos y auxiliares (siempre con contexto):
```json
{ "german": ["hatte", "an", "einem", "Frühlingsnachmittag"], "spanish": ["había", "en", "una", "tarde", "primaveral"] }
{ "german": ["monatelang", "eine", "so", "gefahrdrohende"], "spanish": ["durante", "meses", "una", "tan", "amenazante"] }
{ "german": ["zeigte,"], "spanish": ["mostraba,"] }
```

### Preposiciones y artículos (con sustantivos):
```json
{ "german": ["von", "seiner", "Wohnung"], "spanish": ["desde", "su", "vivienda"] }
{ "german": ["in", "der", "Prinzregentenstraße"], "spanish": ["en", "la", "Prinzregentenstraße"] }
{ "german": ["des", "Jahres"], "spanish": ["del", "año"] }
```

## Verificación de Calidad

Antes de considerar un segmento como válido, verificar:
1. ¿Tiene suficientes palabras (mínimo 2-3 si son funcionales)? ✅
2. ¿Tiene sentido por sí solo en alemán? ✅
3. ¿Tiene sentido por sí solo en español? ✅
4. ¿La traducción corresponde exactamente al alemán? ✅
5. ¿Al unirlo con el anterior y siguiente, fluye correctamente? ✅
6. ¿No excede las 5 palabras? ✅

## Reglas de Excepción

Pueden ir solos:
- **Nombres propios**: `["Aschenbach"]`
- **Sustantivos concretos**: `["Spaziergang"]` → `["paseo"]`
- **Interjecciones**: `["Ach!"]` → `["¡Ay!"]`
- **Citas directas cortas**: `["Ja,"]` → `["Sí,"]`

NO deben ir solos:
- **Verbos auxiliares**: ❌ `["hatte"]` → `["había"]`
- **Preposiciones**: ❌ `["an"]` → `["en"]`
- **Artículos**: ❌ `["das"]` → `["el/que"]`
- **Pronombres**: ❌ `["ihm"]` → `["le"]`
- **Conjunciones**: ❌ `["dass"]` → `["que"]`

## Nota para el Editor

Esta app es para **practicar lectura de alemán a nivel intermedio**. La segmentación debe facilitar:
- Comprensión gradual del texto sin fragmentar demasiado
- Aprendizaje de vocabulario en contexto significativo
- Entendimiento de la estructura gramatical alemana
- Traducción inmediata y precisa de cada unidad

**Prioridad**: Equilibrio entre granularidad y contexto. El estudiante intermedio necesita ver palabras funcionales EN CONTEXTO, no aisladas.
