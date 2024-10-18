import crypto from 'crypto'

export interface Reading {
  timestamp: number;
  name: string;
  value: number;
}

// This is a fake database which stores data in-memory while the process is running
// Feel free to change the data structure to anything else you would like
export const database: Record<string, Reading> = {};


const generateKey = () =>
  crypto.randomBytes(16).toString('hex')

/**
 * Store a reading in the database using the given key
 */
export const addReading = (reading: Reading): Promise<Reading> =>
  new Promise((resolve, reject) => {
    const key = generateKey();
    database[key] = reading;
    resolve(reading);
  })

/**
 * Retrieve a reading from the database using the given key
 */
export const getReadingsTimestampRange = (from: number, to: number): Promise<Reading[]> =>
  new Promise((resolve, reject) => {
    resolve(Object.values(database).filter(r => r.timestamp >= from && r.timestamp <= to))
  })
