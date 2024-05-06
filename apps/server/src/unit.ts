import { Position, UnitData } from '@code-and-conquer/interfaces';
import { rectangleToPolygon } from './utils';
import Game from './game';

export default class Unit {
  public game: Game;
  public position: Position;
  public targetPosition: Position | null = null;
  public rotation: number;

  public unitRadius = 4;

  public speed = .1;
  public maxSpeed = 5;
  public attemptedToReRoute = 0;

  public pathIndex = 0;
  public navPath: Position[] = [];

  public boundingPolygon: Position[] = [];

  constructor(game: Game, position: Position, rotation: number) {
    this.game = game;
    this.position = position;
    this.rotation = rotation;
  }

  serialize(): UnitData {
    return {
      position: this.position,
      rotation: this.rotation,
      navigationPath: this.navPath,
      boundingPolygon: this.boundingPolygon,
    };
  }

  run() {
    // console.log('Unit running');

    //Movement
    if (this.targetPosition && this.navPath) {
      if (this.navPath.length > 0) {
        if (
          Math.abs(this.position.x - this.navPath[this.pathIndex].x) <= this.unitRadius &&
          Math.abs(this.position.y - this.navPath[this.pathIndex].y) <= this.unitRadius
        ) {
          this.pathIndex++;
          if (this.pathIndex >= this.navPath.length) {
            this.pathIndex = 0;
            this.navPath = [];
          }
        }
      }

      const nextPosition = this.navPath[this.pathIndex];
      if (!nextPosition) return;

      this.moveTowards(nextPosition);
    }
  }

  generateNavPath() {
    const path = this.game.map.findPath(this.position, this.targetPosition);
    if (!path) return;

    this.navPath = path;
    this.pathIndex = 0;
  }

  setTargetPosition(position: Position) {
    this.targetPosition = position;
    this.generateNavPath();
  }

  moveTowards(position: Position) {
    this.rotateTowards(position);

    const dx = position.x - this.position.x;
    const dy = position.y - this.position.y;
    const angle = Math.atan2(dy, dx);

    const newPosition = {
      x: this.position.x + this.speed * Math.cos(angle),
      y: this.position.y + this.speed * Math.sin(angle),
    };

    const isBlocked = this.game.map.isPositionOccupied(this, newPosition);

    if (isBlocked) {
      this.speed -= .1;
      if (this.speed < .5) this.speed = .5;

      if (this.speed === .5 && this.attemptedToReRoute < 3) {
        this.attemptedToReRoute++;
        const newPath = this.game.map.findAlternatePath(this);

        if (newPath) {
          this.navPath = newPath;
          this.pathIndex = 0;
        }
        return;
      }
      return;
    }
    this.attemptedToReRoute = 0;
    this.speed += .5;
    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;

    this.position = newPosition;

    this.updateBoundingPolygon();
  }

  updateBoundingPolygon() {
    this.boundingPolygon = rectangleToPolygon({
      width: this.unitRadius * 2,
      height: this.unitRadius * 2,
      rotation: this.rotation,
      position: this.position,
    });
  }

  getBoundingBox() {
    return {
      x: this.position.x - this.unitRadius,
      y: this.position.y - this.unitRadius,
      width: this.unitRadius * 2,
      height: this.unitRadius * 2,
    };
  }

  rotateTowards(position: Position) {
    const dx = position.x - this.position.x;
    const dy = position.y - this.position.y;
    const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const angleDifference = targetAngle - this.rotation;

    // Ensure the angle difference is between -180 and 180
    let normalizedAngleDifference = ((angleDifference + 180) % 360) - 180;
    if (normalizedAngleDifference < -180) {
      normalizedAngleDifference += 360;
    }

    let rotationSpeed = 30;
    // scale speed based on the angle difference
    if (Math.abs(normalizedAngleDifference) > 90) {
      rotationSpeed = rotationSpeed * 2;
    }

    // Calculate the amount to rotate based on the speed
    const rotationAmount = Math.sign(normalizedAngleDifference) * Math.min(Math.abs(normalizedAngleDifference), rotationSpeed);

    // Apply the rotation
    this.rotation += rotationAmount;
  }
}
