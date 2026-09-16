<div align="center">

# CASEFILE
### The Swapped Scarab
**Investigate. Verify. Decide.**

An Egyptian museum mystery powered by retrieval-augmented generation.

ITI Level 2 Graduation Project · Mariam Wael Elkholey · 2026

[Watch the demo](docs/casefile-demo.mp4) · [Explore the screenshots](#inside-the-investigation) · [Run locally](#setup) · [RAG evaluation](#quality-and-evaluation)

</div>

![Casefile — The Swapped Scarab, Egyptian museum concept artwork](frontend/assets/casefile-cover.png)

> **Three trays. One conflicting record.** An exhibition is about to open at the fictional Lantern Museum in Cairo. The objects and their paperwork disagree. Your task is to discover what happened—and show which sources support your conclusion.

Casefile turns document research into a guided investigation. Ask an assistant about the case, inspect its cited passages, compare museum records with authentic scholarship, and build a theory before unlocking follow-up evidence.
<img width="254" height="254" alt="Codex Image Sep 16, 2026, 12_12_19 AM" src="https://github.com/user-attachments/assets/321e50b9-fb0a-482d-8a7a-7d25b2c9fd2e" />

The mystery and its characters are fictional. The archaeological reference is real. The system keeps those roles distinct: historical scholarship helps interpret objects; incident records establish what happened in the fictional case.

## Watch the walkthrough

[![Play the Casefile walkthrough](docs/screenshots/opening.png)](docs/casefile-demo.mp4)

**[Watch or download the 3:03 captioned demo](docs/casefile-demo.mp4)** 



## What you can do

| Feature | Player experience |
| --- | --- |
| Cinematic introduction | Eight briefing scenes combine presentation artwork with an interactive 3D scarab. |
| Guided investigation | Four leads explain what to read, what to ask and what to check next. |
| Evidence-grounded research | Ask questions and inspect the exact retrieved passages behind the response. |
| Authentic reference access | Open the original University of Chicago publication alongside the case records. |
| Investigation notebook | Pin documents, separate observations from interpretations and link related evidence. |
| Progressive discovery | Save an initial theory to unlock staff statements and a final physical inspection. |
| Final findings | Submit structured conclusions and supporting references; preserve written reasoning for review. |
| Two interfaces | Use the cinematic HTML/CSS/JavaScript app or the assignment's Streamlit chat interface. |

## Inside the investigation

**The images below are actual application captures.** Presentation concept art is collected separately further down.

### Enter the case

![Full-screen opening with interactive 3D scarab](docs/screenshots/opening.png)

<details>
<summary>See the briefing and guided research workspace</summary>

![Text and 3D scarab briefing](docs/screenshots/briefing.png)

![Guided lead and research workspace](docs/screenshots/research.png)

</details>

### Ask, then verify

![Live answer linking tray P to seal 731 with a citation](docs/screenshots/answer.png)

The assistant's answer is the start of the investigation. Open a cited passage to check the claim against its source.

| Inspect the source | Browse the records |
| --- | --- |
| ![Exact source passage inspector](docs/screenshots/source-inspector.png) | ![Grouped evidence library](docs/screenshots/evidence-library.png) |

### Build your explanation

![Notebook with observations, interpretations and questions to verify](docs/screenshots/notebook.png)

<details>
<summary>Spoilers: follow-up evidence, final findings and rubric feedback</summary>

![Unlocked follow-up inspection](docs/screenshots/follow-up.png)

![Final findings with references](docs/screenshots/final-findings.png)

![Structured investigation result](docs/screenshots/result.png)

The score reflects the structured case rubric. It is not a measurement of language-model accuracy, and the free-text explanation is saved rather than automatically graded for reasoning quality.

</details>

<details>
<summary>Design archive: earlier opening and fictional character portraits</summary>

These two user-supplied screenshots show an earlier interface version.

![Earlier opening design](docs/screenshots/opening-earlier.png)

![Fictional museum team portraits](docs/screenshots/characters-earlier.png)

</details>

## Presentation and visual direction

Gold, sandstone, museum architecture and a duck guide give the project its visual identity. These are **AI-generated presentation illustrations**, not screenshots, historical photographs or source documents. Some illustrative names, dates, tray labels and objects differ from the playable case; the application records remain authoritative.

| The mystery | Research through evidence |
| --- | --- |
| ![Presentation illustration of three museum trays](frontend/assets/briefing-trays.png) | ![Presentation illustration of asking and inspecting sources](frontend/assets/briefing-research.png) |
| ![Presentation illustration of conflicting records](frontend/assets/briefing-records.png) | ![Presentation overview of fictional and authentic data](docs/presentation/authentic-foundation.png) |

<details>
<summary>View the presentation journey and duck mascot</summary>

![Illustrated investigation journey](docs/presentation/investigation-journey.png)

<img src="frontend/assets/duck-guide.png" alt="Egyptian duck holding a scroll" width="210"> <img src="frontend/assets/duck-thinking.png" alt="Thinking Egyptian duck guide" width="210">

</details>

## How the RAG system works

1. **Prepare:** load ten fictional records and two authentic scholarly extracts, retaining document IDs, pages and unlock stages.
2. **Index:** split text into 170-word chunks with 35-word overlap, create 384-dimensional MiniLM embeddings and persist them in Chroma.
3. **Retrieve:** combine semantic search with BM25-style keyword ranking through reciprocal-rank fusion. Apply the player's unlock stage before retrieval.
4. **Add context when needed:** intended-destination questions can receive up to two additional inspection/reference passages beyond the five primary results.
5. **Generate:** send the question and retrieved context to the selected Ollama or Groq model with instructions to distinguish facts, claims and uncertainty.
6. **Validate and inspect:** validate citation IDs and return the answer with passages. If generation fails, show explicitly labeled retrieval-only evidence.

```mermaid
flowchart LR
    D[Case records and scholarly extracts] --> C[Chunk and embed]
    C --> V[(Persisted Chroma)]
    UI[Custom frontend or Streamlit] --> API[FastAPI]
    API --> S[(SQLite session state)]
    API --> R[Stage-filtered hybrid retrieval]
    V --> R
    R --> G[Selected provider: Ollama or Groq]
    G --> Q[Citation-ID validation]
    Q --> A[Answer and inspectable source passages]
    A --> UI
```

The case solution and evaluation answers are not ingested. Locked follow-up documents remain excluded from retrieval, including context-expansion queries.

## Technology

| Layer | Implementation |
| --- | --- |
| Custom frontend | HTML, CSS, JavaScript and Three.js |
| Required chat interface | Streamlit |
| API and validation | Python 3.12, FastAPI and Pydantic |
| Embeddings | ONNX MiniLM, 384 dimensions |
| Retrieval | Chroma, semantic search, BM25-style ranking and rank fusion |
| Local generation | Ollama with Qwen2.5:1.5b |
| Optional hosted generation | Groq; configured model documented in `.env.example` |
| Player progress | SQLite with token-based investigation sessions |
| Verification | pytest/TestClient, retrieval evaluation and reviewed model outputs |

The published configuration defaults to **local Ollama**. The private demo configuration uses **Groq**. Results from one provider must not be attributed to the other. The 3D scarab is illustrative graphics, not computer vision; no fine-tuning is claimed.

## Data and provenance

| Collection | Size | Role |
| --- | --- | --- |
| Fictional incident records | 10 documents | Inspection, packing, dispatch, receiving, correspondence, register changes and follow-up evidence. |
| Authentic scholarship | 2 page extracts | Historical context for distinguishing scarab types and physical features. |
| Indexed corpus | 28 chunks in the evaluated build | Passage-level retrieval with source metadata. |

**Reference:** Emily Teeter, with T. G. Wilfong (2003), *Scarabs, Scaraboids, Seals, and Seal Impressions from Medinet Habu*, University of Chicago. Printed pages 122–123 correspond to PDF pages 146–147.

[Open the original publisher PDF](https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/OIP118.pdf).

This source does not report the fictional incident or authenticate the case objects. Public source packages exclude the copyrighted extracts and generated vector-store content; prepare them locally from the original PDF using the commands below.

## Setup
Use Python 3.12. From the project root:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt -r frontend/requirements.txt -r notebooks/requirements.txt
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
On Windows activate with `.venv\Scripts\activate`. Install Ollama separately, start it, then run:
```bash
ollama pull qwen2.5:1.5b
python scripts/prepare_reference.py /absolute/path/to/OIP118.pdf
python scripts/ingest.py
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Open http://127.0.0.1:8000 and http://127.0.0.1:8000/docs. First embedding use downloads a small model cache; Ollama downloads roughly 1 GB. The API loads the persisted store once. Stop the API before rebuilding that store, then restart it.

In a second terminal with the same environment:
```bash
streamlit run frontend/app.py
```
Streamlit reads `frontend/.env`; the custom frontend uses same-origin relative API paths. No backend URL is hard-coded in the API client.

## Notebook
Run `notebooks/rag_pipeline.ipynb` from a fresh kernel. It inspects the corpus, explains 170-word chunks and 35-word overlap, builds MiniLM embeddings, persists Chroma and demonstrates retrieval and prompting. Do not run its index rebuild while the application is using the same store. The evaluation is explicit about model failures and requires claim-level review.

## Environment variables
| Variable | Purpose |
|---|---|
| OLLAMA_HOST | Defaults to http://127.0.0.1:11434 |
| OLLAMA_MODEL | qwen2.5:1.5b |
| GENERATION_PROVIDER | ollama by default; optional groq |
| GROQ_API_KEY | Optional secret stored locally; never commit |
| GROQ_MODEL | Hosted model selection; see backend/.env.example |
| FRONTEND_ORIGIN | Allowed CORS origin |
| API_BASE_URL | Streamlit backend address, from frontend/.env |

Local Ollama runs on CPU on the Intel Mac. Selecting Groq sends questions and retrieved passages to that service. There is no automatic cloud fallback. See [Groq setup](docs/GROQ_SETUP.md).

## API
Create a session and copy its token:
```bash
curl -X POST http://127.0.0.1:8000/sessions
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/query \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer REPLACE_WITH_SESSION_TOKEN' \
  -d '{"question":"Which seal was placed on tray P?"}'
```
Response contains `answer`, `sources`, `evidence` and `mode`. `evidence_only` means retrieval results are shown without an accepted generated answer. Citation validation checks IDs; it does not prove claim support.

| Endpoint | Purpose |
|---|---|
| GET /health | Index and model availability |
| POST /sessions | New investigation |
| GET /documents | Unlocked source documents |
| GET/PUT /progress | Notes, pins and relationships |
| POST /query | Retrieve and generate |
| POST /unlock | Initial theory of at least 40 characters unlocks E09/E10 |
| POST /submit | Check structured selections; save written reasoning |

The initial-theory gate checks length, not correctness. Final score evaluates structured choices and reference selection; written reasoning is saved for review. Session tokens live in browser local storage. This classroom prototype is not hardened for unrestricted public hosting.

## Quality and evaluation

| Check | Recorded result | Interpretation |
| --- | --- | --- |
| Backend tests | 10 passing tests in the recorded validation run | API behavior, state handling, unlock gates and generation validation. |
| Expected-source coverage | 83.8% baseline → **90.3%** after hybrid retrieval/context expansion | Same 18 development questions; not a held-out benchmark or answer accuracy. |
| Context budget | Five primary passages; selected questions may add two | The comparison does not hold context size constant. |
| Hosted answer checks | Targeted regressions improved several previously failing answers | Small reviewed sample; not a general accuracy score. |
| Local model | Retained for the local-model workflow; errors remain documented | Hosted improvements do not establish local-model quality. |

Read the [RAG quality report](docs/RAG_QUALITY_UPDATE.md) and [reviewed local evaluation](evaluation/RESULTS.md) for methodology, failure cases and limits.

```bash
python -m pytest backend/tests -q
python scripts/evaluate.py
# Optional live-generation evaluation:
python scripts/evaluate.py --generate
```

Evaluation commands overwrite the current result file; preserve reviewed results first. Citation-ID validation checks that references exist in retrieved context—it does not prove that every claim is supported. An earlier evaluator's authored-answer substitution was removed; historical substituted outputs are not valid live-generation evidence.

## Scope and limitations

- This is a classroom prototype with one authored case, not a production authentication or forensic system.
- Groq requires internet access and account availability. Local Ollama may be slower and less reliable on modest hardware.
- Model errors, incomplete grounding and rate limits remain possible. Generation failure is surfaced rather than replaced with a prewritten answer.
- An initial theory of 40 characters unlocks follow-up evidence; this gate checks completion, not correctness.
- Final structured answers and references are checked against a rubric. Written reasoning is saved for human review.
- Public deployment and production security hardening are separate from running the local demo.

## Project guide

| Resource | Contents |
| --- | --- |
| [Player walkthrough](docs/PLAYER_WALKTHROUGH.md) | Step-by-step playthrough, suggested questions and spoiler-labeled findings. |
| [Presentation handoff](docs/PRESENTATION_HANDOFF.md) | Slide plan, speaker notes, technical explanations and Q&A. |
| [Notebook](notebooks/rag_pipeline.ipynb) | Corpus inspection, chunking, embeddings, retrieval and generation workflow. |
| [Groq setup](docs/GROQ_SETUP.md) | Optional hosted-provider configuration. |
| [Submission status](docs/SUBMISSION_STATUS.md) | Submission preparation and outstanding checks. |
| [Checkpoints](docs/checkpoints/) | Development decisions, completed work and remaining tasks. |

## Structure
```text
backend/app/         API, settings, schemas, retrieval, generation, session storage
backend/data/        case records; locally prepared references and vectors
backend/tests/       API and persistence checks
frontend/            custom app, Streamlit client, visual assets
notebooks/           pipeline report
scripts/             preparation, ingestion, evaluation
backend/Dockerfile   optional container recipe
docs/                schema, presentation, walkthrough, checkpoints
```

## Docker (optional, not validated here)
Build from the project root after preparing local data:
```bash
docker build -f backend/Dockerfile -t casefile .
docker run --rm -p 8000:8000 -e OLLAMA_HOST=http://host.docker.internal:11434 casefile
```
The host Ollama service must be reachable from the container. Native local setup is the demonstrated path. Public deployment, clean installation validation and presentation status are tracked separately in docs/SUBMISSION_STATUS.md.

## Credits

**Mariam Wael Elkholey** — ITI Level 2 graduation project, 2026.
