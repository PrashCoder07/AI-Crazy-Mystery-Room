import mongoose from 'mongoose';
import { env } from './env.js';
import Mystery from '../models/Mystery.js';

const memory = new Map();
let mongoReady = false;
mongoose.set('sanitizeFilter', true);

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.info('[db] MONGO_URI is not set; using in-memory case storage.');
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3500 });
    mongoReady = true;
    console.info('[db] MongoDB connected.');
  } catch (error) {
    mongoReady = false;
    console.warn(`[db] MongoDB unavailable; using in-memory storage (${error.message}).`);
  }
}

export function storageMode() {
  return mongoReady ? 'mongodb' : 'memory';
}

export async function saveMystery(record) {
  if (!mongoReady) {
    memory.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  const document = await Mystery.findByIdAndUpdate(
    record.id,
    { $set: { publicData: record.publicData, solution: record.solution, notes: record.notes, verdict: record.verdict, createdAt: record.createdAt, source: record.source, ownerId: record.ownerId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).select('+solution');
  return toRecord(document);
}

export async function updateMystery(id, updater) {
  const record = await getMystery(id);
  if (!record) return null;
  return saveMystery(updater(record));
}

export async function getMystery(id) {
  if (!mongoReady) return memory.has(id) ? structuredClone(memory.get(id)) : null;
  const document = await Mystery.findById(id).select('+solution');
  return document ? toRecord(document) : null;
}

export async function getPublicMystery(id) {
  const record = await getMystery(id);
  return record ? publicMystery(record) : null;
}

export async function listMysteries() {
  if (!mongoReady) return [...memory.values()].map((record) => ({ ...publicMystery(record), ownerId: record.ownerId }));
  const documents = await Mystery.find().sort({ createdAt: -1 }).select('-solution');
  return documents.map((document) => ({ ...publicMystery({ id: document._id.toString(), publicData: document.publicData, notes: document.notes || [], createdAt: document.createdAt, source: document.source }), ownerId: document.ownerId }));
}

export async function deleteMystery(id) {
  if (!mongoReady) return memory.delete(id);
  const result = await Mystery.findByIdAndDelete(id);
  return Boolean(result);
}

function toRecord(document) {
  return {
    id: document._id.toString(),
    publicData: document.publicData,
    solution: document.solution,
    notes: document.notes || [],
    createdAt: document.createdAt,
    source: document.source,
    ownerId: document.ownerId,
    verdict: document.verdict,
  };
}

export function publicMystery(record) {
  return {
    id: record.id,
    ...record.publicData,
    createdAt: record.createdAt,
    generationMode: record.source,
  };
}
