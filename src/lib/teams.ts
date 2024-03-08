export type Team = {
    name: string;
    slug: string;
    description?: string;
}

export type Game = {
    date: Date;
    home: Team;
    away: Team;
    home_score: number;
    away_score: number;
}

export function listTeams(search?: string): Team[] {
    const team: Team = {
        name: 'skotliðið',
        slug: 'skotlidid',
        description: 'geggjað lið'
    };

    return [team, team, team];
}

export function getTeam(slug: string): Team {
    return {
        name: 'temp', 
        slug
    };
}
    
