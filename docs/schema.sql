CREATE TABLE sessions (
 token TEXT PRIMARY KEY,
 state TEXT NOT NULL -- JSON: stage, pins, notes, initial_theory, submission
);
-- Chroma: chunk ID, 384-dimensional embedding, text, and metadata
-- (id, title, kind, stage, source_url, page). Stage filter is mandatory.
