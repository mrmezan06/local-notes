import Dexie from 'dexie';

export const db = new Dexie('MyLocalWorkspaceDB');

db.version(1).stores({
  auth: '++id, username', // Stores keycheck, vaultKeyCheck, and recoveryHash
  notes: '++id, title, type, isDeleted, updatedAt',
  vault: '++id, label, isDeleted',
  contacts: '++id, name, isDeleted',
  trash: '++id, originalTable, type',
});
