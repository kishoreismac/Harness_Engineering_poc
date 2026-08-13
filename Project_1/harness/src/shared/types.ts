export type IndexStatus = 'idle' | 'indexing' | 'ready' | 'error';
export type DocumentStatus = 'pending' | 'indexed' | 'error';
export interface DocumentRecord { id: string; title: string; filename: string; size: number; importedAt: string; status: DocumentStatus; }
export interface Chunk { id: string; documentId: string; index: number; text: string; characterCount: number; wordCount: number; }
export interface Citation { documentId: string; documentTitle: string; chunkId: string; excerpt: string; }
export interface QaResponse { id: string; question: string; answer: string; citations: Citation[]; confidence: number; askedAt: string; }
export interface IndexState { status: IndexStatus; documentCount: number; chunkCount: number; lastActivity: string | null; message?: string; }
export interface ImportResult { canceled: boolean; document?: DocumentRecord; }
export interface KnowledgeBaseApi {
  documents: { list(): Promise<DocumentRecord[]>; import(): Promise<ImportResult>; get(id: string): Promise<{ document: DocumentRecord; content: string } | null>; delete(id: string): Promise<void>; };
  indexing: { start(documentId?: string): Promise<IndexState>; status(): Promise<IndexState>; chunks(documentId: string): Promise<Chunk[]>; };
  qa: { ask(question: string): Promise<QaResponse>; history(): Promise<QaResponse[]>; };
}
export const IPC_CHANNELS = {
  documentsList: 'documents:list', documentsImport: 'documents:import', documentsGet: 'documents:get', documentsDelete: 'documents:delete',
  indexingStart: 'indexing:start', indexingStatus: 'indexing:status', indexingChunks: 'indexing:chunks', qaAsk: 'qa:ask', qaHistory: 'qa:history'
} as const;
