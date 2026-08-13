import { randomUUID } from 'node:crypto';
import type { QaResponse } from '../shared/types';
import { DocumentService } from './document-service';
import { IndexingService } from './indexing-service';
import { PersistenceService } from './persistence-service';

export class QaService {
  constructor(private readonly persistence: PersistenceService, private readonly documents: DocumentService, private readonly indexing: IndexingService) {}
  async history(): Promise<QaResponse[]> { return this.persistence.readJson<QaResponse[]>('qa-history.json', []); }
  async ask(question: string): Promise<QaResponse> { const clean = question.trim(); if (!clean) throw new Error('Question is required.'); const terms = [...new Set(clean.toLowerCase().match(/[a-z0-9]+/g) ?? [])].filter((term) => term.length > 2); const documents = await this.documents.list(); const candidates = (await Promise.all(documents.map(async (document) => (await this.indexing.chunks(document.id)).map((chunk) => ({ document, chunk, score: terms.filter((term) => chunk.text.toLowerCase().includes(term)).length }))))).flat().filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3); const citations = candidates.map(({ document, chunk }) => ({ documentId: document.id, documentTitle: document.title, chunkId: chunk.id, excerpt: chunk.text.slice(0, 180) })); const response: QaResponse = { id: randomUUID(), question: clean, answer: citations.length ? `The most relevant information in your library says: ${candidates[0].chunk.text.slice(0, 420)}${candidates[0].chunk.text.length > 420 ? '…' : ''}` : 'I could not find grounded information for that question. Try indexing your documents or using more specific terms.', citations, confidence: citations.length ? 0.85 : 0.3, askedAt: new Date().toISOString() }; const history = await this.history(); history.push(response); await this.persistence.writeJson('qa-history.json', history); return response; }
}
