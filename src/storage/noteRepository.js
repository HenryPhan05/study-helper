const fs = require('node:fs/promises');
const path = require('node:path');

class LocalJsonNoteRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async list() {
    const notes = await this.#readAll();
    return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async findById(id) {
    const notes = await this.#readAll();
    return notes.find((note) => note.id === id) || null;
  }

  async create(note) {
    const notes = await this.#readAll();
    notes.push(note);
    await this.#writeAll(notes);
    return note;
  }

  async #readAll() {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  async #writeAll(notes) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(notes, null, 2));
  }
}

module.exports = { LocalJsonNoteRepository };
