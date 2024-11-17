import { Position, StructureData } from '@code-and-conquer/interfaces';
import Player from './player';
import Unit from './unit';
import { availablUnits, UnitClass } from './unitFactory';
import Game from './game';
import { ulid } from 'ulid';

export default class Structure {
  public owner?: Player;

  public game: Game;
  public id: string;
  public position: Position;
  public shape: StructureData['shape'];
  public health: {
    current: number;
    max: number;
  };
  public occupants: {
    current: Unit[];
    max: number;
  };

  constructor(game: Game, structureData: StructureData, owner?: Player) {
    this.owner = owner;

    this.game = game;
    this.id = `STR-${ulid()}`;
    this.position = structureData.position;
    this.shape = structureData.shape;
    this.health = {
      current: structureData.maxHealth,
      max: structureData.maxHealth,
    };
    this.occupants = {
      current: [],
      max: structureData.maxOccupants,
    };
  }

  tick() {
    // Called every game tick to perform actions. This is intended to be
    // overridden by subclasses.
  }

  createUnit(unit: UnitClass) {
    const unitClass = availablUnits[unit];
    if (!unitClass) {
      throw new Error(`Invalid unit type: ${unit}`);
    }

    const newUnit = new unitClass(this.game, this.owner, this.position);
    this.game.units.push(newUnit);
    // TODO
  }
}
