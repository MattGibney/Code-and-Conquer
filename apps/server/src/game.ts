import { ulid } from 'ulid';
import Map from './map';
import { MapName } from './mapFactory';
import Player from './player';
import Structure from './structure';
import Unit from './unit';

const TPS = 60;

type GameSettings = {
  map: MapName;
  maxPlayers: number;
  startingResources: number;
};

export default class Game {
  public id: string;

  public players: Player[] = [];
  public units: Unit[] = [];
  public structures: Structure[] = [];
  public map: Map;
  public settings: GameSettings;

  private timer: NodeJS.Timeout;

  constructor(settings: GameSettings) {
    console.log('Game created');
    this.id = `GME-${ulid()}`;
    this.settings = settings;

    // Load map
    this.map = new Map(this, this.settings.map);
  }

  start() {
    // Timer
    this.timer = setInterval(() => {
      this.tick();
    }, 1000 / TPS);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  tick() {
    // Game loop
    this.units.forEach((unit) => unit.tick());
    this.structures.forEach((structure) => structure.tick());
  }

  addPlayer(player: Player) {
    if (this.players.length >= this.settings.maxPlayers) {
      throw new Error('Game is full');
    }

    if (this.timer) {
      throw new Error('Game has already started');
    }

    // Apply Settings
    player.resources = this.settings.startingResources;

    player.game = this;

    this.players.push(player);
  }
}
