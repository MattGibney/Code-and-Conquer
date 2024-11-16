import { MapData, MapStructureData } from '@code-and-conquer/interfaces';
import { MapName, availableMaps } from './mapFactory';
import Game from './game';
import { availablStructures } from './structureFactory';

export default class Map {
  private game: Game;

  public terrain: MapData['terrain'];

  constructor(game: Game, mapName: MapName) {
    this.game = game;

    console.log('Loading Map');
    const mapData = availableMaps[mapName];

    this.terrain = mapData.terrain;

    for (const structureData of mapData.structures) {
      this.addStructure(structureData);
    }
  }

  addStructure(structureData: MapStructureData) {
    const structureClass = availablStructures[structureData.type];
    const structure = new structureClass(this.game, structureData);

    // Check for collisions
    // TODO: Implement collision detection

    this.game.structures.push(structure);
  }
}
