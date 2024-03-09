import { Request, Response, NextFunction} from 'express';
import slugify from 'slugify';

import { Game } from '../lib/types.js';
import { gameMapper } from '../lib/mappers.js';
import { getGames, getGameBySlug, deleteGameBySlug, insertGame, conditionalUpdate } from '../lib/db.js';

export async function listGames(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const games = await getGamesByTeamId(team.id);

  if (!games) {
    return next(new Error('unable to get games'));
  }

  return res.json(games);
}

export async function getGame(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug, gameId } = req.params;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const game = await getGameByGameId(gameId);

  if (!game) {
    return next();
  }

  return res.json(game);
}

export async function createGamesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const { gameId, title, units, semester, level, url } = req.body;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const gameToCreate: Omit<Game, 'id'> = {
    title,
    units,
    semester,
    level,
    url,
    gameId,
  };

  const createdGame = await insertGame(
    gameToCreate,
    team.id,
    false,
  );

  if (!createdGame) {
    return next(new Error('unable to create game'));
  }

  return res.json(gameMapper(createdGame));
}

const gameFields = ['gameId', 'title', 'level', 'url', 'semester', 'units'];

export const createGame = [
  stringValidator({ field: 'gameId', maxLength: 16 }),
  stringValidator({ field: 'title', maxLength: 64 }),
  body('units')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('units must be a number between 0.5 and 100'),
  semesterValidator({ field: 'semester' }),
  stringValidator({ field: 'level', valueRequired: false, maxLength: 128 }),
  stringValidator({ field: 'url', valueRequired: false, maxLength: 256 }),
  gameTitleDoesNotExistValidator,
  gameIdDoesNotExistValidator,
  xssSanitizerMany(gameFields),
  validationCheck,
  genericSanitizerMany(gameFields),
  createGamesHandler,
].flat();

export const updateGame = [
  stringValidator({ field: 'gameId', maxLength: 16, optional: true }),
  stringValidator({ field: 'title', maxLength: 64, optional: true }),
  body('units')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('units must be a number between 0.5 and 100')
    .optional(),
  semesterValidator({ field: 'semester', optional: true }),
  stringValidator({
    field: 'level',
    valueRequired: false,
    maxLength: 128,
    optional: true,
  }),
  stringValidator({
    field: 'url',
    valueRequired: false,
    maxLength: 256,
    optional: true,
  }),
  atLeastOneBodyValueValidator(gameFields),
  xssSanitizerMany(gameFields),
  validationCheck,
  genericSanitizerMany(gameFields),
  updateGameHandler,
].flat();

export async function updateGameHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug, gameId } = req.params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const game = await getGameByGameId(gameId);

  if (!game) {
    return next();
  }

  const {
    gameId: newGameId,
    title,
    level,
    url,
    semester,
    units,
  } = req.body;

  const fields = [
    typeof newGameId === 'string' && newGameId ? 'game_id' : null,
    typeof title === 'string' && title ? 'title' : null,
    typeof level === 'string' && level ? 'level' : null,
    typeof url === 'string' && url ? 'url' : null,
    typeof semester === 'string' && semester ? 'semester' : null,
    typeof units === 'string' && units ? 'units' : null,
  ];

  const values = [
    typeof newGameId === 'string' && newGameId ? newGameId : null,
    typeof title === 'string' && title ? title : null,
    typeof level === 'string' && level ? level : null,
    typeof url === 'string' && url ? url : null,
    typeof semester === 'string' && semester ? semester : null,
    typeof units === 'string' && units ? units : null,
  ];

  const updated = await conditionalUpdate('game', game.id, fields, values);
  console.log('updated :>> ', updated);
  if (!updated) {
    return next(new Error('unable to update game'));
  }

  const updatedGame = gameMapper(updated.rows[0]);
  return res.json(updatedGame);
}

export async function deleteGame(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug, gameId } = req.params;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const game = await getGameByGameId(gameId);

  if (!game) {
    return next();
  }

  const result = await deleteGameByGameId(gameId);

  if (!result) {
    return next(new Error('unable to delete game'));
  }

  return res.status(204).json({});
}
