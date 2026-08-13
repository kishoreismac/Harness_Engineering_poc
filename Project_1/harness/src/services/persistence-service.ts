import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class PersistenceService {
  readonly root: string;
  readonly contentDir: string;
  readonly chunksDir: string;
  readonly indexDir: string;
  private readonly ready: Promise<void>;
  constructor(userDataPath: string) {
    this.root = path.join(userDataPath, 'knowledge-base-data');
    this.contentDir = path.join(this.root, 'content');
    this.chunksDir = path.join(this.root, 'chunks');
    this.indexDir = path.join(this.root, 'index');
    this.ready = this.ensureDirectories();
  }
  async ensureDirectories(): Promise<void> { await Promise.all([this.root, this.contentDir, this.chunksDir, this.indexDir].map((directory) => mkdir(directory, { recursive: true }))); }
  async readJson<T>(filename: string, fallback: T): Promise<T> { await this.ready; try { return JSON.parse(await readFile(path.join(this.root, filename), 'utf8')) as T; } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback; throw error; } }
  async writeJson(filename: string, value: unknown): Promise<void> { await this.ready; const target = path.join(this.root, filename); const temporary = `${target}.tmp`; await mkdir(path.dirname(target), { recursive: true }); await writeFile(temporary, JSON.stringify(value, null, 2), 'utf8'); await rename(temporary, target); }
  async readText(relativePath: string): Promise<string> { await this.ready; return readFile(path.join(this.root, relativePath), 'utf8'); }
  async writeText(relativePath: string, value: string): Promise<void> { await this.ready; const target = path.join(this.root, relativePath); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, value, 'utf8'); }
  async remove(relativePath: string): Promise<void> { await this.ready; await rm(path.join(this.root, relativePath), { force: true }); }
}
