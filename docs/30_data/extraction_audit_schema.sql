CREATE TABLE IF NOT EXISTS extraction_runs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  provider_attempted TEXT NOT NULL,
  provider_used TEXT NOT NULL,
  request_json TEXT NOT NULL,
  normalized_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_extraction_runs_document_id ON extraction_runs(document_id);
CREATE INDEX IF NOT EXISTS idx_extraction_runs_created_at ON extraction_runs(created_at);
