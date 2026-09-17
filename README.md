
<div align="center">

    
# CASEFILE

<img align="center" src="frontend/assets/duck-guide.png" alt="Casefile duck guide" width="300" height="300" hspace="10">

### The Swapped Scarab

**Investigate. Verify. Decide.**

An Egyptian museum mystery powered by retrieval-augmented generation.

ITI Level 2 Graduation Project · Mariam Wael Elkholey · 2026

[Watch the demo](docs/casefile-demo.mp4) · [Explore the screenshots](#inside-the-investigation) · [Run locally](#setup) · [RAG evaluation](#quality-and-evaluation)

</div>

![Casefile — The Swapped Scarab, Egyptian museum concept artwork](frontend/assets/casefile-cover.png)

> **Three trays. One conflicting record.** An exhibition is about to open at the fictional Lantern Museum in Cairo. The objects and their paperwork disagree. Your task is to discover what happened—and show which sources support your conclusion.
>
> <img width="1672" height="941" alt="ChatGPT Image Sep 15, 2026, 10_44_18 PM" src="https://github.com/user-attachments/assets/ed49904b-9592-41f3-870d-9de58e3689f4" />


<img align="right" src="frontend/assets/duck-guide.png" alt="Casefile duck guide" width="300" height="300" hspace="14">
</br>
</br>
Casefile turns document research into a guided investigation. Ask an assistant about the case, inspect its cited passages, compare museum records with authentic scholarship, and build a theory before unlocking follow-up evidence.

</br>
</br>
The mystery and its characters are fictional. The archaeological reference is real. The system keeps those roles distinct: historical scholarship helps interpret objects; incident records establish what happened in the fictional case.

<br clear="both">

## Watch the walkthrough


[![Play the Casefile walkthrough](docs/screenshots/opening.png)](docs/casefile-demo.mp4)


<img align="right" src="frontend/assets/duck-thinking.png" alt="Casefile duck guide" width="300" height="300" hspace="14">
</br>
</br>
</br>

**[Watch or download the 3:03 captioned demo](docs/casefile-demo.mp4)** — a recorded local walkthrough covering the briefing, a live research response, source inspection, notebook, follow-up evidence and final findings. 
</br>
</br>
The MP4 is included in this repository. Depending on your viewer, the link may download it instead of playing inline.

<br clear="both">

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
<img width="5088" height="3276" alt="Casefile _ The Swapped Scarab · 4 36pm · 09-15" src="https://github.com/user-attachments/assets/c0c643be-097d-49ef-8483-0e5e1ef2f1c4" />

<details>
<summary>See the briefing and guided research workspace</summary>

![Text and 3D scarab briefing](docs/screenshots/briefing.png)

![Guided lead and research workspace](docs/screenshots/research.png)

</details>

### Ask, then verify

![Live answer linking tray P to seal 731 with a citation](docs/screenshots/answer.png)

<img align="right" src="frontend/assets/duck-guide.png" alt="Casefile duck guide" width="200" height="200" hspace="14">

</br>
</br>

The assistant's answer is the start of the investigation.
</br>
</br>

Open a cited passage to check the claim against its source.

<br clear="both">

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


<br clear="both">

| The mystery | Research through evidence |
| --- | --- |
| ![Presentation illustration of three museum trays](frontend/assets/briefing-trays.png) | ![Presentation illustration of asking and inspecting sources](frontend/assets/briefing-research.png) |
| ![Presentation illustration of conflicting records](frontend/assets/briefing-records.png) | ![Presentation overview of fictional and authentic data](docs/presentation/authentic-foundation.png) |

<details>
<summary>View the presentation journey</summary>

![Illustrated investigation journey](docs/presentation/investigation-journey.png)

</details>

## How the RAG system works

<img align="right" src="frontend/assets/duck-thinking.png" alt="Duck guide thinking through the RAG workflow" width="300" height="300" hspace="14">

1. **Prepare:** load ten fictional records and two authentic scholarly extracts, retaining document IDs, pages and unlock stages.
2. **Index:** split text into 170-word chunks with 35-word overlap, create 384-dimensional MiniLM embeddings and persist them in Chroma.
3. **Retrieve:** combine semantic search with BM25-style keyword ranking through reciprocal-rank fusion. Apply the player's unlock stage before retrieval.
4. **Add context when needed:** intended-destination questions can receive up to two additional inspection/reference passages beyond the five primary results.
5. **Generate:** send the question and retrieved context to the selected Ollama or Groq model with instructions to distinguish facts, claims and uncertainty.
6. **Validate and inspect:** validate citation IDs and return the answer with passages. If generation fails, show explicitly labeled retrieval-only evidence.

<br clear="both">

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

<br clear="both">

## Technology

<table>
  <tr>
    <td width="100%" valign="top">

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

</table>

<br clear="both">

## Data and provenance

| Collection | Size | Role |
| --- | --- | --- |
| Fictional incident records | 10 documents | Inspection, packing, dispatch, receiving, correspondence, register changes and follow-up evidence. |
| Authentic Book |  page extracts | Historical context for distinguishing scarab types and physical features. |
| Indexed corpus | 28 chunks in the evaluated build | Passage-level retrieval with source metadata. |

</br>
</br>
<img align="right" src="frontend/assets/duck-guide.png" alt="Casefile duck guide" width="300" height="300" hspace="14">

</br>
</br>

**Reference:** Emily Teeter, with T. G. Wilfong (2003), *Scarabs, Scaraboids, Seals, and Seal Impressions from Medinet Habu*, University of Chicago.
[Open the original publisher PDF](https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/OIP118.pdf).

</br>
</br>
This source does not report the fictional incident or authenticate the case objects. Public source packages exclude the copyrighted extracts and generated vector-store content; prepare them locally from the original PDF using the commands below.

<br clear="both">

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

<br clear="both">

## Environment variables

| Variable | Purpose |
|---|---|
| OLLAMA_HOST | Defaults to http://127.0.0.1:11434 |
| OLLAMA_MODEL | qwen2.5:1.5b |
| GENERATION_PROVIDER | ollama by default; optional groq |
| API_BASE_URL | Streamlit backend address, from frontend/.env |

<img align="right" src="frontend/assets/duck-guide.png" alt="Casefile duck guide" width="300" height="300" hspace="14">

Local Ollama runs on CPU on the Intel Mac. Selecting Groq sends questions and retrieved passages to that service. There is no automatic cloud fallback. 

<br clear="both">

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

<img align="right" src="frontend/assets/duck-thinking.png" alt="Casefile duck guide" width="300" height="300" hspace="14">

Response contains `answer`, `sources`, `evidence` and `mode`. `evidence_only` means retrieval results are shown without an accepted generated answer. Citation validation checks IDs; it does not prove claim support.

<br clear="both">

| Endpoint | Purpose |
|---|---|
| GET /health | Index and model availability |
| POST /sessions | New investigation |
| GET /documents | Unlocked source documents |
| GET/PUT /progress | Notes, pins and relationships |
| POST /query | Retrieve and generate |
| POST /unlock | Initial theory of at least 40 characters unlocks E09/E10 |
| POST /submit | Check structured selections; save written reasoning |

<br clear="both">

## Quality and evaluation

| Check | Recorded result | Interpretation |
| --- | --- | --- |
| Backend tests | 10 passing tests in the recorded validation run | API behavior, state handling, unlock gates and generation validation. |
| Expected-source coverage | 83.8% baseline → **90.3%** after hybrid retrieval/context expansion | Same 18 development questions; not a held-out benchmark or answer accuracy. |
| Context budget | Five primary passages; selected questions may add two | The comparison does not hold context size constant. |
| Hosted answer checks | Targeted regressions improved several previously failing answers | Small reviewed sample; not a general accuracy score. |
| Local model | Retained for the local-model workflow; errors remain documented | Hosted improvements do not establish local-model quality. |

<br clear="both">


<br clear="both">



## Structure

```text
backend/app/         API, settings, schemas, retrieval, generation, session storage
backend/data/        case records; locally prepared references and vectors
backend/tests/       API and persistence checks
frontend/            custom app, Streamlit client, visual assets
notebooks/           pipeline report
scripts/             preparation, ingestion, evaluation
backend/Dockerfile   optional container recipe
```

## Docker

Build from the project root after preparing local data:
```bash
docker build -f backend/Dockerfile -t casefile .
docker run --rm -p 8000:8000 -e OLLAMA_HOST=http://host.docker.internal:11434 casefile
```


## Credits

<img align="right" src="frontend/assets/duck-thinking.png" alt="Casefile duck guide" width="300" height="300" hspace="14">
</br>
</br>

**Mariam Wael Elkholey** — ITI Level 2 graduation project, 2026.

<br clear="both">
