import express, { Request, Response, NextFunction} from 'express';
import { getTeams, Team } from '../lib/teams';

export const teamsRouter = express.Router();


export async function indexRoute(req: Request, res: Response) {
    const searchQS = req.query.search;

    let search  = typeof searchQS === 'string' ? searchQS : undefined;

    const teams = getTeams();

    let foundTeams: Team[]
    if (typeof search) {
        foundTeams = teams.find((team) => team.name.indexOf(search) >= 0) ?? [];
    } else {
        foundTeams = teams;
    }

    console.log(search);


    const data = {
        'name': 'liðið'
    }
    return res.json(teams);
}
 
teamsRouter.get('/', indexRoute);