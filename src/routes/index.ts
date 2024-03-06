import express, { Request, Response, NextFunction} from 'express';
import { teamsRouter } from './teams-router.js';

export const apiRouter = express.Router();

export async function indexRoute(req: Request, res: Response) {
    const data = {
        '/teams': {
            'get': {}
        }
    };
    return res.json(data);
}

apiRouter.get('/', indexRoute);
apiRouter.use('/teams', teamsRouter);