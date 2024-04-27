import { Cliff, GameMap, Structure } from '@code-and-conquer/interfaces';

export default class Map {
  public size: { width: number; height: number };
  public cliffs: Cliff[];
  public structures: Structure[];

  constructor(gameMap: GameMap) {
    this.size = gameMap.size;
    this.cliffs = gameMap.cliffs;
    this.structures = gameMap.structures;
  }

  serialize() {
    return {
      size: this.size,
      cliffs: this.cliffs,
      structures: this.structures,
    };
  }
}
