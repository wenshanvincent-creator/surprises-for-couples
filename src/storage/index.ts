import type { ProjectBundle } from '../domain/types';
import { validateBundle } from '../domain/validation';

const DATABASE = 'surprises-for-couples';
const STORE = 'projects';
const CURRENT = 'current';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let blocked = false;
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
    request.onerror = () => reject(request.error ?? new Error('无法打开本地数据库。'));
    request.onblocked = () => {
      blocked = true;
      reject(new Error('本地数据库升级被其他标签页阻止，请关闭其他页面后重试。'));
    };
  });
}

async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = database.transaction(STORE, mode);
      const request = operation(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? request.error ?? new Error('本地保存事务已中止。'));
      tx.onerror = () => reject(tx.error ?? request.error ?? new Error('本地数据库操作失败。'));
    });
  } finally {
    database.close();
  }
}

export async function loadProject(): Promise<ProjectBundle | null> {
  const saved = await transaction<ProjectBundle | undefined>('readonly', store => store.get(CURRENT));
  return saved === undefined ? null : validateBundle(saved);
}
export async function saveProject(bundle: ProjectBundle): Promise<void> {
  const validated = validateBundle(bundle);
  await transaction('readwrite', store => store.put(validated, CURRENT));
}
export async function clearProject(): Promise<void> {
  await transaction('readwrite', store => store.delete(CURRENT));
}
