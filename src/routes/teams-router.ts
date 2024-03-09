import express, { Request, Response, NextFunction} from 'express';
import slugify from 'slugify';

import { Team } from '../lib/types';
import { getTeams } from '../lib/db';


export const teamsRouter = express.Router();

export async function listTeams(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const teams = await getTeams(); 
  
    if (!teams) {
      return next(new Error('unable to get teams'));
    }
  
    return res.json(teams);
  }

export async function getTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  return res.json(team);
}

export async function createTeamHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { title, description } = req.body;

  const teamToCreate: Omit<Team, 'id'> = {
    title,
    slug: slugify(title),
    description,
    courses: [],
  };

  const createdDeprtment = await insertTeam(teamToCreate, false);

  if (!createdDeprtment) {
    return next(new Error('unable to create team'));
  }

  return res.status(201).json(createdDeprtment);
}

export const createTeam = [
  stringValidator({ field: 'title', maxLength: 64 }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1000,
  }),
  teamDoesNotExistValidator,
  xssSanitizer('title'),
  xssSanitizer('description'),
  validationCheck,
  genericSanitizer('title'),
  genericSanitizer('description'),
  createTeamHandler,
];

export const updateTeam = [
  stringValidator({ field: 'title', maxLength: 64, optional: true }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1000,
    optional: true,
  }),
  atLeastOneBodyValueValidator(['title', 'description']),
  xssSanitizer('title'),
  xssSanitizer('description'),
  validationCheck,
  updateTeamHandler,
];

export async function updateTeamHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const { title, description } = req.body;

  const fields = [
    typeof title === 'string' && title ? 'title' : null,
    typeof title === 'string' && title ? 'slug' : null,
    typeof description === 'string' && description ? 'description' : null,
  ];

  const values = [
    typeof title === 'string' && title ? title : null,
    typeof title === 'string' && title ? slugify(title).toLowerCase() : null,
    typeof description === 'string' && description ? description : null,
  ];

  const updated = await conditionalUpdate(
    'team',
    team.id,
    fields,
    values,
  );

  if (!updated) {
    return next(new Error('unable to update team'));
  }

  const updatedTeam = teamMapper(updated.rows[0]);
  return res.json(updatedTeam);
}

export async function deleteTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const result = await deleteTeamBySlug(slug);

  if (!result) {
    return next(new Error('unable to delete team'));
  }

  return res.status(204).json({});
}



/*
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