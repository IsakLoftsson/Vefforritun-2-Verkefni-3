import express, { Request, Response, NextFunction} from 'express';
export const teamsRouter = express.Router();

export async function indexRoute(req: Request, res: Response) {
    const data = {
        'name': 'liðið'
    }
    return res.json(data);
}
 
teamsRouter.get('/', indexRoute);