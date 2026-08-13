import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DocumentRecord } from '../shared/types';
import { PersistenceService } from './persistence-service';

const MAX_SIZE = 10 * 1024 * 1024;
export class DocumentService {
  constructor(private readonly persistence: PersistenceService) {}
  async list(): Promise<DocumentRecord[]> { return this.persistence.readJson<DocumentRecord[]>('documents-meta.json', []); }
  async get(id: string): Promise<{ document: DocumentRecord; content: string } | null> { const document = (await this.list()).find((item) => item.id === id); return document ? { document, content: await this.persistence.readText(`content/${id}.txt`) } : null; }
  async importFile(filePath: string, content: string, size: number): Promise<DocumentRecord> {
    const extension = path.extname(filePath).toLowerCase();
    if (!['.txt', '.md'].includes(extension)) throw new Error('Only .txt and .md files are supported.');
    if (size > MAX_SIZE) throw new Error('Files must be 10 MB or smaller.');
    const document: DocumentRecord = { id: randomUUID(), title: path.basename(filePath, extension), filename: path.basename(filePath), size, importedAt: new Date().toISOString(), status: 'pending' };
    const documents = await this.list(); documents.push(document);
    await this.persistence.writeText(`content/${document.id}.txt`, content); await this.persistence.writeJson('documents-meta.json', documents); return document;
  }
  async updateStatus(id: string, status: DocumentRecord['status']): Promise<void> { const documents = await this.list(); const document = documents.find((item) => item.id === id); if (document) { document.status = status; await this.persistence.writeJson('documents-meta.json', documents); } }
  async delete(id: string): Promise<void> { await this.persistence.writeJson('documents-meta.json', (await this.list()).filter((item) => item.id !== id)); await Promise.all([this.persistence.remove(`content/${id}.txt`), this.persistence.remove(`chunks/${id}.json`)]); }
}
