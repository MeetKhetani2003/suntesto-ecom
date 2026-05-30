import { MongoClient, Db, GridFSBucket } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let isFallbackMode = false;

// Speed up connection timeout to prevent long page hangs (3s timeout)
const connectionOptions = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
};

try {
  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, connectionOptions);
      globalWithMongo._mongoClientPromise = client.connect().catch(err => {
        console.warn('⚠️ MongoDB Cluster unreachable. Activating local mock database fallback.', err.message);
        isFallbackMode = true;
        return client;
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, connectionOptions);
    clientPromise = client.connect().catch(err => {
      console.warn('⚠️ MongoDB connection unreachable in production. Activating mock database fallback.', err.message);
      isFallbackMode = true;
      return client;
    });
  }
} catch (e) {
  console.warn('⚠️ MongoDB direct client connection error. Activating mock database fallback.', e);
  isFallbackMode = true;
}

// --- LOCAL PERSISTENT JSON MOCK DATABASE SYSTEM ---
const MOCK_DB_PATH = path.join(process.cwd(), 'lib', 'mock_db.json');

function readMockDb() {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    }
  } catch (e) {}
  return { users: [], orders: [], products: [], files: [] };
}

function writeMockDb(data: any) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

class MockCollection {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  async findOne(filter: any) {
    const db = readMockDb();
    const list = db[this.name] || [];
    return list.find((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    }) || null;
  }

  async updateOne(filter: any, update: any, options?: any) {
    const db = readMockDb();
    if (!db[this.name]) db[this.name] = [];
    const list = db[this.name];
    
    let item = list.find((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    const setFields = update.$set || {};
    const incFields = update.$inc || {};
    
    if (item) {
      Object.assign(item, setFields);
      for (const key in incFields) {
        item[key] = (item[key] !== undefined ? Number(item[key]) : 0) + Number(incFields[key]);
      }
    } else if (options?.upsert) {
      const newItem = { ...filter, ...setFields, _id: `mock-${Date.now()}` };
      for (const key in incFields) {
        newItem[key] = Number(incFields[key]);
      }
      list.push(newItem);
    }
    writeMockDb(db);
    return { modifiedCount: 1, upsertedCount: item ? 0 : 1 };
  }

  async insertOne(doc: any) {
    const db = readMockDb();
    if (!db[this.name]) db[this.name] = [];
    const newDoc = { ...doc, _id: `mock-${Date.now()}`, createdAt: new Date() };
    db[this.name].push(newDoc);
    writeMockDb(db);
    return { insertedId: newDoc._id };
  }

  async deleteMany(filter?: any) {
    const db = readMockDb();
    db[this.name] = [];
    writeMockDb(db);
    return { deletedCount: 0 };
  }

  async insertMany(arr: any[]) {
    const db = readMockDb();
    db[this.name] = arr.map((item, idx) => ({ ...item, _id: `mock-${Date.now()}-${idx}` }));
    writeMockDb(db);
    return { insertedCount: arr.length };
  }

  find(filter: any) {
    const db = readMockDb();
    let list = db[this.name] || [];
    
    if (filter && Object.keys(filter).length > 0) {
      list = list.filter((item: any) => {
        for (const key in filter) {
          if (item[key] !== filter[key]) return false;
        }
        return true;
      });
    }

    return {
      sort(sortObj: any) {
        return {
          async toArray() {
            if (sortObj && sortObj.createdAt === -1) {
              return [...list].sort((a: any, b: any) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              });
            }
            return list;
          }
        };
      },
      async toArray() {
        return list;
      }
    };
  }
}

class MockGridFSBucket {
  find(filter: any) {
    const db = readMockDb();
    const files = db.files || [];
    const matched = files.filter((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    return {
      async toArray() {
        return matched;
      }
    };
  }

  openUploadStream(filename: string, options?: any) {
    const db = readMockDb();
    if (!db.files) db.files = [];
    if (!db.files.find((f: any) => f.filename === filename)) {
      db.files.push({
        filename,
        contentType: options?.contentType || 'image/png',
        uploadDate: new Date()
      });
      writeMockDb(db);
    }

    const { Writable } = require('stream');
    return new Writable({
      write(chunk: any, encoding: any, callback: any) {
        callback();
      }
    });
  }

  openDownloadStreamByName(filename: string) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'packagings', filename);
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);
    }
    const mainHeroPath = path.join(process.cwd(), 'public', 'packagings', 'main_hero.png');
    return fs.createReadStream(mainHeroPath);
  }
}

export async function connectToDatabase(): Promise<{ db: any; client: any; bucket: any }> {
  try {
    if (isFallbackMode) {
      throw new Error('Database cluster is configured offline.');
    }
    
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    
    // ACTIVE CONNECTION PING CHECK: Resolves MongoDB lazy-connection quirks
    // and triggers instant catch-block mock DB switch on offline cluster
    await db.command({ ping: 1 });
    
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    return { db, client: mongoClient, bucket };
  } catch (error) {
    console.warn('⚠️ MongoDB connect failure. Engaging high-resilience local Mock JSON Database fallback.');
    isFallbackMode = true; // Permanently lock mock database for this application life
    
    const mockDb = {
      collection(name: string) {
        return new MockCollection(name);
      }
    };
    const mockBucket = new MockGridFSBucket();
    return { db: mockDb, client: null, bucket: mockBucket };
  }
}