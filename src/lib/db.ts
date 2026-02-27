import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_DB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGO_DB_URI environment variable inside .env.local'
    );
}

declare global {
    var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Connection timeouts to prevent hanging
            serverSelectionTimeoutMS: 5000,  // 5s to find server
            connectTimeoutMS: 10000,         // 10s to connect
            socketTimeoutMS: 45000,          // 45s socket timeout
            maxPoolSize: 10,                 // Connection pool
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
