# RAG (Retrieval-Augmented Generation) Module
test
This module injects retrieved document context into user messages before they are sent to the Qwen model. It ensures the model can answer domain-specific questions by grounding its responses in pre-indexed verification data.

## Architecture

```
User message
    │
    ▼
preprocessMessages()            (src/lib/server/endpoints/preprocessMessages.ts)
    │
    ├── downloadFiles()
    ├── injectClipboardFiles()
    ├── stripEmptyInitialSystemMessage()
    │
    └── injectRAGContext()       ◄── THIS MODULE
            │
            ├── VerificationDataLoader.search()    ── exact or fuzzy match
            ├── formatContext()                     ── format retrieved chunks
            └── buildRAGUserMessage()               ── build augmented prompt
                    │
                    ▼
            Augmented message sent to Qwen
```

## Files

### `index.ts`
Barrel export file. Re-exports the public API:
- `verificationDataLoader` — singleton data loader instance
- `injectRAGContext` — main context injection function
- `SearchResult`, `VerificationEntry` — TypeScript types

### `types.ts`
Defines the two core data structures:

**`SearchResult`** — A single retrieved document chunk:
| Field             | Type     | Description                                      |
|-------------------|----------|--------------------------------------------------|
| `rank`            | number   | Ranking position of this result                  |
| `location`        | string   | Source document location (e.g. file path, title)  |
| `chapter`         | string?  | Chapter name, if applicable                      |
| `section_num`     | string?  | Section number within the document               |
| `page`            | number?  | Page number                                      |
| `block_type`      | string?  | Type of content block (e.g. paragraph, table)    |
| `chunk_id`        | string?  | Unique identifier for this chunk                 |
| `score`           | number   | Relevance score from the retrieval system        |
| `content_preview` | string?  | Shortened preview of the content                 |
| `full_content`    | string   | Full text content of the retrieved chunk         |

**`VerificationEntry`** — A query with its pre-computed search results:
| Field              | Type            | Description                                  |
|--------------------|-----------------|----------------------------------------------|
| `query`            | string          | The original question                        |
| `description`      | string          | Additional context about what is being asked |
| `expected_keywords`| string[]?       | Keywords expected in a correct answer        |
| `answer`           | string?         | Reference answer, if available               |
| `search_results`   | SearchResult[]  | Pre-retrieved document chunks for this query |

### `verificationData.ts`
Contains the `VerificationDataLoader` class (exported as a singleton `verificationDataLoader`).

**Data source:** Reads from a JSON file at the path specified by the `RAG_DATA_PATH` environment variable, defaulting to:
```
/mmfs1/gscratch/scrubbed/maryxn/wisefind/verification_data/verification_data/verification_data.json
```

**Key behaviors:**
- **Lazy loading** — Data is loaded on first `search()` or `getDescription()` call, not at import time.
- **Query index** — Builds an in-memory `Map<string, VerificationEntry>` keyed by normalized (lowercase, trimmed) queries for O(1) exact lookups.
- **Search strategy (two-tier):**
  1. **Exact match** — Checks the query index for a normalized exact match.
  2. **Fuzzy match** — Falls back to keyword-overlap scoring (Jaccard-like). Words shorter than 2 characters are filtered out. Results are only returned if the overlap score exceeds 0.3 (30%).
- **`search(query, topK=3)`** — Returns up to `topK` `SearchResult` objects.
- **`getDescription(query)`** — Returns the `description` field for an exact-match query, or empty string.

### `contextInjector.ts`
Handles the actual prompt augmentation. Contains three functions:

**`formatContext(results: SearchResult[])`** (internal)
Formats retrieved results into a string:
```
[Source 1: <location>]
<full_content>

[Source 2: <location>]
<full_content>
```
This format matches the template used in `qwen_evaluate.py`.

**`buildRAGUserMessage(query, description, context)`** (internal)
Constructs the augmented user message using this template:
```
[Context]
<formatted context>

[User Query]
Question: <query>
Specific Aspect: <description>    (only if description is non-empty)
Answer:
```

**`injectRAGContext(messages, topK=3)`** (exported)
The main entry point. Called from `preprocessMessages()` in the message pipeline:
1. Finds the **last user message** in the conversation.
2. Extracts the text content of that message as the search query.
3. Calls `verificationDataLoader.search()` to retrieve relevant chunks.
4. If results are found, replaces the user message content with the augmented version (context + query template).
5. Returns the modified messages array (original array is not mutated).

## How It Connects to the Model

The RAG injection happens in `preprocessMessages()` (`src/lib/server/endpoints/preprocessMessages.ts`), which is the last preprocessing step before messages are sent to the endpoint (Qwen). The `enableRAG` parameter defaults to `true`, so RAG is active for all conversations unless explicitly disabled.

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `RAG_DATA_PATH` | `/mmfs1/gscratch/scrubbed/maryxn/wisefind/verification_data/verification_data/verification_data.json` | Path to the verification data JSON file |

## Example

Given a user query `"What are the fire safety requirements?"` and matching verification data, the message sent to Qwen becomes:

```
[Context]
[Source 1: Building Code Ch. 7]
Fire safety requirements include the installation of smoke detectors...

[Source 2: Safety Standards §3.2]
All commercial buildings must have fire extinguishers placed...

[User Query]
Question: What are the fire safety requirements?
Specific Aspect: Fire safety regulations for commercial buildings
Answer:
```
