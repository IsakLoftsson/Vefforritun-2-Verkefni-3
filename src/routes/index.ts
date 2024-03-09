import express, { Request, Response, NextFunction} from 'express';

import { listTeams, createTeam, getTeam, updateTeam, deleteTeam } from './teams-router.js';
import { listGames, getGame } from './games-router.js';
// , createGame, updateGame, deleteGame } from './games-router.js';

export const apiRouter = express.Router();

export async function indexRoute(req: Request, res: Response) {
    return res.json([
      {
        href: '/teams',
        methods: ['GET', 'POST'],
      },
      {
        href: '/teams/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      {
        href: '/games',
        methods: ['GET', 'POST'],
      },
      {
        href: '/games/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
    ]);
}

apiRouter.get('/', indexRoute);

apiRouter.get('/', listTeams);
apiRouter.post('/', createTeam);
apiRouter.get('/:slug', getTeam);
apiRouter.patch('/:slug', updateTeam);
apiRouter.delete('/:slug', deleteTeam);

apiRouter.get('/', listGames);
// apiRouter.post('/', createGame);
apiRouter.get('/:id', getGame);
// apiRouter.patch('/:id', updateGame);
// apiRouter.delete('/:id', deleteGame);