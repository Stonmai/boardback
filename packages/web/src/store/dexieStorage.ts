import Dexie, { type Table } from 'dexie';

interface KVEntry {
  key: string;
  value: string;
}

class BoardBackDB extends Dexie {
  kv!: Table<KVEntry, string>;

  constructor() {
    super('boardback-db');
    this.version(1).stores({ kv: '&key' });
  }
}

let _db: BoardBackDB | null = null;
let _hydrated = false;
let _writeTimer: ReturnType<typeof setTimeout> | null = null;

const getDB = (): BoardBackDB => {
  if (!_db) _db = new BoardBackDB();
  return _db;
};

export const dexieStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const entry = await getDB().kv.get(name);
    return entry?.value ?? null;
  },
  setItem: (name: string, value: string): Promise<void> => {
    if (!_hydrated) return Promise.resolve();
    if (_writeTimer) clearTimeout(_writeTimer);
    return new Promise<void>(resolve => {
      _writeTimer = setTimeout(() => {
        getDB().kv.put({ key: name, value }).then(() => resolve()).catch(() => resolve());
      }, 400);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    await getDB().kv.delete(name);
  },
  markHydrated: () => { _hydrated = true; },
};
