import { Position } from '@code-and-conquer/interfaces';
import Game from './game';
import Player from './player';
import { ulid } from 'ulid';

export default class Unit {
  public game: Game;
  public player: Player;

  public id: string;
  public position: Position;

  constructor(game: Game, player: Player, position: Position) {
    this.game = game;
    this.player = player;

    this.id = `UNT-${ulid()}`;
    this.position = position;
  }

  tick() {
    // Called every game tick to perform actions. This is intended to be
    // overridden by subclasses.
  }

  move(position: Position) {
    // TODO: Implement movement logic
    this.position = position;
  }
}
