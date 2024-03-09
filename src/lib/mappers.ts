import {
    Game,
    Team,
  } from './types.js';
  
  /**
   * Map a potential game to a game.
   * @param potentialGame Data that might be a game.
   * @returns Mapped game or null if the data is not a game.
   */
  export function gameMapper(potentialGame: unknown): Game | null {
    // Type cast the potential game to a Partial `GameDb` or null.
    // This allows us to use the optional chaining operator to safely access
    // properties on the potential game and mapping to a game if our
    // conditions are met.
    const game = potentialGame as Partial<GameDb> | null;
  
    if (!game || !game.id || !game.game_id || !game.title) {
      return null;
    }
  
    // Create exactly the game object we want to return, i.e. the mapped game.
    // This is not perfect since we are not checking if the values are of the
    // correct type, but we are assuming that the database returns the correct
    // types. We should probably add some validation...
    const mapped: Game = {
      id: game.id,
      gameId: game.game_id,
      title: game.title,
      units: game.units ?? undefined,
      semester: valueToSementer(game.semester) ?? undefined,
      level: game.level ?? undefined,
      url: game.url ?? undefined,
    };
  
    return mapped;
  }
  
  /**
   * Map a potential list of games to an array of games.
   * @param potentialGames Data that might be a list of games.
   * @returns Array of mapped games, empty if no games are mapped.
   */
  export function gamesMapper(potentialGames: unknown): Array<Game> {
    const games = potentialGames as Array<unknown> | null;
  
    if (!games || !Array.isArray(games)) {
      return [];
    }
  
    const mapped = games.map(gameMapper);
  
    // Filter out any null values from the mapped array using the `filter` method
    // and a type guard function.
    return mapped.filter((i): i is Game => Boolean(i));
  }
  
  /**
   * Map a potential team to a team.
   * @param potentialTeam Data that might be a team.
   * @param potentialGames Data that might be a list of games.
   * @returns Mapped team or null if the data is not a team.
   */
  export function teamMapper(
    potentialTeam: unknown,
    potentialGames?: unknown,
  ): Team | null {
    const team = potentialTeam as Partial<Team> | null;
  
    if (!team || !team.id || !team.title || !team.slug) {
      return null;
    }
  
    const games = gamesMapper(potentialGames);
  
    const links: Links = {
      self: {
        href: `/teams/${team.slug}`,
      },
      games: {
        href: `/teams/${team.slug}/games`,
      },
    };
  
    const mapped: Team = {
      id: team.id,
      title: team.title,
      slug: team.slug,
      description: team.description ?? undefined,
      created: team.created,
      updated: team.updated,
      games: games.length ? games : undefined,
      _links: links,
    };
  
    return mapped;
  }
  
  /**
   * Map a potential array of teams to an array of teams.
   * @param potentialTeams Data that might be a list of teams.
   * @returns Array of mapped teams, empty if no teams are mapped.
   */
  export function teamsMapper(
    potentialTeams: unknown,
  ): Array<Team> {
    const teams = potentialTeams as Array<unknown> | null;
  
    if (!teams) {
      return [];
    }
  
    const mapped = teams.map((dept) => teamMapper(dept));
  
    return mapped.filter((i): i is Team => Boolean(i));
  }
  