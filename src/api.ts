import * as db from './database';

export const addReadings = async (data: db.Reading[]) => {
  const addProms = data.map(d => db.addReading(d))
  await Promise.all(addProms)
  return data
}

export const addBadReadings = async (data: string[]) => {
  return
}

export const getReadings = async ({ from, to }: ({ from: Date, to: Date })) => {
  const res = await db.getReadingsTimestampRange(from.getTime() / 1000, to.getTime() / 1000)
  return res
}

export default {
  addReadings,
  addBadReadings,
  getReadings
}