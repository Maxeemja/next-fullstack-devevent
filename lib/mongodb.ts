import mongoose, { type Mongoose } from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI ?? '';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // The global cache survives Next.js hot reloads in development.
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongoose ?? {
  conn: null,
  promise: null,
};

globalThis.mongoose = cached;

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
