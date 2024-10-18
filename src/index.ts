import express, { Express } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Joi, { Err } from 'joi';

import { Reading } from './database';
import api from './api';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const joi = Joi.extend(joi => ({
  base: joi.object(),
  coerce: (value, helpers) => {
    const matches = value.match(/^(\d{10})\s*(\w+)\s(\d+\.\d{1,2})$/)
    if (!matches)
      throw new Error('not a valid feed')
    return { value: { timestamp: parseInt(matches[1]), name: matches[2], value: parseFloat(matches[3]) } }
  },
  type: 'feed'
}))

app.post('/data', async (req, res) => {
  try {
    const raw = req.body.split('\n');
    const data: Reading[] = []
    const failed: string[] = []
    raw.forEach((r: string) => {
      try {
        const line = joi.feed().validate(r)
        data.push(line.value)
      }
      catch (err: any) {
        failed.push(r)
      }
    })
    const result = await api.addReadings(data)
    if (failed.length > 0)
      await api.addBadReadings(failed)
    return res.json({ result: `${result.length} records added` })
  }
  catch (err: any) {
    console.log(err.message)
  }

  return res.json({ success: false });
});

app.get('/data', async (req, res) => {
  try {
    const getSchema = Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required()
    })
    const params = getSchema.validate(req.query)
    const result = await api.getReadings(params.value)
    res.send(result)
  }
  catch (err: any) {
    console.log(err.message)
  }
});

const server = app.listen(PORT, () => console.log(`Running on port ${PORT} ⚡`));

export default server