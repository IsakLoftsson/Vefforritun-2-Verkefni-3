import { readFile } from 'fs/promises';
import { query } from '../lib/db.js';

async function drop() {
  const data = await readFile('../sql/drop.sql');
  await query(data.toString('utf-8'));
}

async function schema() {
  const data = await readFile('../sql/schema.sql');
  await query(data.toString('utf-8'));
}

async function insert() {
  const data = await readFile('../sql/insert.sql');
  await query(data.toString('utf-8'));
}

async function setup() {
  await drop();
  await schema();
  await insert();
}

async function main() {
  await setup();
}

main().catch((e) => console.error(e));