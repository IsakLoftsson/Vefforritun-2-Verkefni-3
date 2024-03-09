import express, { Request, Response, NextFunction} from 'express';
import { teamsRouter, listTeams } from './teams-router.js';
import { gamesRouter } from './games-router.js';

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
apiRouter.use('/teams', teamsRouter);
apiRouter.use('/games', gamesRouter);

teamsRouter.get('/', listTeams);
teamsRouter.post('/', createTeam);
teamsRouter.get('/:slug', getTeam);
teamsRouter.patch('/:slug', updateTeam);
teamsRouter.delete('/:slug', deleteTeam);

gamesRouter.get('/', listGames);
gamesRouter.post('/', createGame);
gamesRouter.get('/:id', getGame);
gamesRouter.patch('/:id', updateGame);
gamesRouter.delete('/:id', deleteGame);