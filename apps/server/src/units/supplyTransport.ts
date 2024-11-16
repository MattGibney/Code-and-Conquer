import { Position } from '@code-and-conquer/interfaces';
import Unit from '../unit';
import Player from '../player';
import Game from '../game';
import ResourceStockpile from '../structures/resourceStockpile';
import SupplyCentre from '../structures/supplyCentre';

const EFFECTIVE_RANGE = 5;

export default class SupplyTransport extends Unit {
  public resources: number;
  public carryingCapacity: number;

  constructor(game: Game, player: Player, position: Position) {
    super(game, player, position);
    this.resources = 0;

    // TODO: Load from unit data
    this.carryingCapacity = 100;
  }

  tick() {
    // Called every game tick to perform actions. This is intended to be
    // overridden by subclasses.
  }

  collectResources(structure: ResourceStockpile) {
    // TODO: Ensure the stockpile is within EFFECTIVE_RANGE

    // Ensure the structure is a ResourceStockpile
    if (!(structure instanceof ResourceStockpile)) {
      throw new Error('Invalid structure: not a ResourceStockpile');
    }

    // Extract resources from the stockpile and add them to the transport
    const resourcesToCollect = Math.min(
      this.carryingCapacity - this.resources,
      structure.resources
    );
    this.resources += resourcesToCollect;
    structure.resources -= resourcesToCollect;
  }

  depositResources(structure: SupplyCentre) {
    // TODO: Ensure the supply centre is within EFFECTIVE_RANGE

    // Ensure the structure is a SupplyCentre
    if (!(structure instanceof SupplyCentre)) {
      throw new Error('Invalid structure: not a SupplyCentre');
    }

    // Transfer resources from the transport to the supply centre
    structure.acceptResources(this.resources);
    this.resources = 0;
  }
}
