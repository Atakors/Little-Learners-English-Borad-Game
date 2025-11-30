import { openDB, DBSchema } from 'idb';
import { TileData } from '../types';

interface BoardGameDB extends DBSchema {
  images: {
    key: number;
    value: {
      id: number;
      hash: string;
      url: string;
      timestamp: number;
    };
  };
}

const DB_NAME = 'little-learners-db';
const STORE_NAME = 'images';

// Initialize the database
export const initDB = async () => {
  return openDB<BoardGameDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

// Save a generated image
export const saveImageToDB = async (id: number, url: string, hash: string) => {
  const db = await initDB();
  await db.put(STORE_NAME, {
    id,
    url,
    hash,
    timestamp: Date.now(),
  });
};

// Load all images, validating hashes against current tile content
export const loadImagesFromDB = async (tiles: TileData[], getHashFn: (t: TileData) => string): Promise<Record<number, string>> => {
  const db = await initDB();
  const allRecords = await db.getAll(STORE_NAME);
  const validImages: Record<number, string> = {};

  allRecords.forEach(record => {
    // Find corresponding tile
    const tile = tiles.find(t => t.id === record.id);
    if (tile) {
      const currentHash = getHashFn(tile);
      // Only return if content hasn't changed
      if (currentHash === record.hash) {
        validImages[record.id] = record.url;
      }
    }
  });

  return validImages;
};

// Export all data to JSON string
export const exportBackup = async (): Promise<string> => {
    const db = await initDB();
    const allRecords = await db.getAll(STORE_NAME);
    const exportData = {
        version: 1,
        date: new Date().toISOString(),
        images: allRecords
    };
    return JSON.stringify(exportData);
};

// Import data from JSON string
export const importBackup = async (jsonString: string): Promise<boolean> => {
    try {
        const data = JSON.parse(jsonString);
        if (!data.images || !Array.isArray(data.images)) return false;

        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Clear existing? No, let's merge/overwrite
        for (const record of data.images) {
            if (record.id && record.url && record.hash) {
                await store.put(record);
            }
        }
        await tx.done;
        return true;
    } catch (e) {
        console.error("Import failed", e);
        return false;
    }
};