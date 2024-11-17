import { ulid } from 'ulid';
import Game from './game';

export default class Player {
  public id: string;
  public name: string;
  public colour: string;
  public resources = 0;
  public game: Game;

  constructor(name: string, colour: string) {
    this.id = `PLR-${ulid()}`;
    this.name = name;
    this.colour = colour;
  }

  serialiseMapData() {
    // Units
    const playerUnits = this.game.units.filter(unit => unit.player === this);
    // Other Visible Units
    // Fetch units within the players field of view


    // Structures
    const playerStructures = this.game.structures.filter(structure => structure.owner === this);
    // Other Visible Structures
    // Fetch structures within the players field of view

    return {
      units: playerUnits,
      structures: playerStructures,
    };
  }

  serialise() {
    return {
      name: this.name,
      color: this.colour,
      resources: this.resources,

      mapData: this.serialiseMapData(),
    };
  }
}
