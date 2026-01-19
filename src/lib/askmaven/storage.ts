import { openDB } from 'idb';

const DB_NAME = 'ask-maven-db';
const STORE = 'kb';
const VERSION = 2; // bump to force upgrade & ensure store exists

type KBRow = { r: any; t: string; e: number[] };
export type KBPacket = { createdAt: number; columns: string[]; rows: KBRow[] };

async function open() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    }
  });
}

export async function saveKB(kb: KBPacket) {
  const db = await open();
  await db.put(STORE, kb, 'current');
}

export async function loadKB(): Promise<KBPacket | null> {
  const db = await open();
  return (await db.get(STORE, 'current')) ?? null;
}

export async function clearKB() {
  const db = await open();
  try { await db.delete(STORE, 'current'); } catch {}
}
