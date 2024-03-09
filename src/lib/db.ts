import pg from 'pg';
import { Game, Team } from '../types.js';
import {
  gameMapper,
  gamesMapper,
  teamMapper,
  teamsMapper,
} from './mappers.js';

let savedPool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (savedPool) {
    return savedPool;
  }

  const { DATABASE_URL: connectionString } = process.env;
  if (!connectionString) {
    console.error('vantar DATABASE_URL í .env');
    throw new Error('missing DATABASE_URL');
  }

  savedPool = new pg.Pool({ connectionString });

  savedPool.on('error', (err) => {
    console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
    throw new Error('error in db connection');
  });

  return savedPool;
}

export async function query(
  q: string,
  values: Array<unknown> = [],
  silent = false,
) {
  const pool = getPool();

  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    if (!silent) console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (!silent) console.error('unable to query', e);
    if (!silent) console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function conditionalUpdate(
  table: 'team' | 'game',
  id: number,
  fields: Array<string | null>,
  values: Array<string | number | null>,
) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i): i is string | number => typeof i === 'string' || typeof i === 'number',
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues: Array<string | number> = (
    [id] as Array<string | number>
  ).concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}

export async function poolEnd() {
  const pool = getPool();
  await pool.end();
}

export async function getTeams(): Promise<Array<Team> | null> {
  const result = await query('SELECT * FROM team');

  if (!result) {
    return null;
  }

  const teams = teamsMapper(result.rows).map((d) => {
    delete d.games;
    return d;
  });

  return teams;
}

export async function getTeamBySlug(
  slug: string,
): Promise<Team | null> {
  const result = await query('SELECT * FROM team WHERE slug = $1', [
    slug,
  ]);

  if (!result) {
    return null;
  }

  const team = teamMapper(result.rows[0]);

  return team;
}

export async function deleteTeamBySlug(slug: string): Promise<boolean> {
  const result = await query('DELETE FROM team WHERE slug = $1', [slug]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}

export async function insertTeam(
  team: Omit<Team, 'id'>,
  silent = false,
): Promise<Team | null> {
  const { title, slug, description } = team;
  const result = await query(
    'INSERT INTO team (title, slug, description) VALUES ($1, $2, $3) RETURNING id, title, slug, description, created, updated',
    [title, slug, description],
    silent,
  );

  const mapped = teamMapper(result?.rows[0]);

  return mapped;
}

export async function insertGame(
  game: Omit<Game, 'id'>,
  teamId: number,
  silent = false,
): Promise<Game | null> {
  const { title, units, semester, level, url, gameId } = game;
  const result = await query(
    'INSERT INTO game (title, units, semester, level, url, team_id, game_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [title, units, semester, level, url, teamId, gameId],
    silent,
  );

  const mapped = gameMapper(result?.rows[0]);

  return mapped;
}

export async function getGamesByTeamId(
  id: number,
): Promise<Array<Game>> {
  const result = await query(`SELECT * FROM game WHERE team_id = $1`, [
    id,
  ]);

  if (!result) {
    return [];
  }

  const games = gamesMapper(result.rows);

  return games;
}

export async function getGameByTitle(title: string): Promise<Game | null> {
  const result = await query(`SELECT * FROM game WHERE title = $1`, [title]);

  if (!result) {
    return null;
  }

  const game = gameMapper(result.rows[0]);
  console.log('title, game :>> ', result.rows[0], title, game);
  return game;
}

export async function getGameByGameId(
  gameId: string,
): Promise<Game | null> {
  const result = await query(`SELECT * FROM game WHERE game_id = $1`, [
    gameId,
  ]);

  if (!result) {
    return null;
  }

  const game = gameMapper(result.rows[0]);

  return game;
}

export async function deleteGameByGameId(
  gameId: string,
): Promise<boolean> {
  const result = await query('DELETE FROM game WHERE game_id = $1', [
    gameId,
  ]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}
