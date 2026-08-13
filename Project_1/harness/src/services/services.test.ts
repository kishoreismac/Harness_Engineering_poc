import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PersistenceService } from './persistence-service';
import { DocumentService } from './document-service';
import { IndexingService } from './indexing-service';
import { QaService } from './qa-service';

describe('knowledge base services', () => {
  let directory: string; let persistence: PersistenceService; let documents: DocumentService; let indexing: IndexingService;
  beforeEach(async () => { directory = await mkdtemp(path.join(tmpdir(), 'knowledge-base-')); persistence = new PersistenceService(directory); documents = new DocumentService(persistence); indexing = new IndexingService(persistence, documents); });
  afterEach(async () => { await rm(directory, { recursive: true, force: true }); });
  it('imports, indexes and retrieves a document', async () => { const document = await documents.importFile('notes.md', 'Alpha project details.\n\nThe deadline is Friday.', 47); const state = await indexing.start(document.id); expect(state.status).toBe('ready'); expect((await indexing.chunks(document.id))[0].wordCount).toBeGreaterThan(0); expect((await documents.get(document.id))?.content).toContain('deadline'); });
  it('answers with citations and persists history', async () => { const document = await documents.importFile('notes.txt', 'The launch deadline is Friday and Jordan owns deployment.', 55); await indexing.start(document.id); const qa = new QaService(persistence, documents, indexing); const answer = await qa.ask('When is the launch deadline?'); expect(answer.confidence).toBe(.85); expect(answer.citations[0].documentTitle).toBe('notes'); expect(await qa.history()).toHaveLength(1); });
  it('rejects unsupported and oversized files', async () => { await expect(documents.importFile('bad.pdf', 'x', 1)).rejects.toThrow('supported'); await expect(documents.importFile('huge.txt', 'x', 11 * 1024 * 1024)).rejects.toThrow('10 MB'); });
});
