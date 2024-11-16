import Player from '../player';
import Structure from '../structure';
import Game from '../game';
import { ResourceStockpileData } from '@code-and-conquer/interfaces';

export default class ResourceStockpile extends Structure {
  public resources: number;

  constructor(game: Game, structureData: ResourceStockpileData, owner?: Player) {
    super(game, structureData, owner);
    this.resources = structureData.resources;
  }
}
