import { StructureData } from '@code-and-conquer/interfaces';
import Game from '../game';
import Player from '../player';
import Structure from '../structure';
import { availablUnits } from '../unitFactory';

const constructibleUnits: (keyof typeof availablUnits)[] = ['SupplyTransport'] as const;

export default class SupplyCentre extends Structure {
  constructor(game: Game, structureData: Partial<StructureData>, owner?: Player) {
    const combinedStructureData: StructureData = {
      position: { x: 0, y: 0 },
      shape: '',
      maxHealth: 1000,
      maxOccupants: 0,
      ...structureData,
    };
    super(game, combinedStructureData, owner);
  }

  tick() {
    // Called every game tick to perform actions. This is intended to be
    // overridden by subclasses.
  }

  acceptResources(quantity: number) {
    this.owner.resources += quantity;
  }

  override createUnit(desiredUnit: typeof constructibleUnits[number]) {
    if (!constructibleUnits.includes(desiredUnit)) {
      throw new Error(`Invalid unit type: ${desiredUnit}`);
    }
    super.createUnit(desiredUnit);
  }
}
