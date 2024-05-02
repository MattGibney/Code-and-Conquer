import { Position } from '@code-and-conquer/interfaces';

export default class Unit {
  public position: { x: number; y: number };
  public rotation: number;

  public pathIndex = 0;
  public navPath: Position[] = [];

  constructor(position: { x: number; y: number }, rotation: number) {
    this.position = position;
    this.rotation = rotation;
  }

  serialize() {
    return {
      position: this.position,
      rotation: this.rotation,
    };
  }

  run() {
    if (this.navPath.length > 0) {
      if (Math.abs(this.position.x - this.navPath[this.pathIndex].x) <= 5 && Math.abs(this.position.y - this.navPath[this.pathIndex].y) <= 5) {
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

  setNavPath(navPath: Position[]) {
    this.navPath = navPath;
    this.pathIndex = 0;
  }

  moveTowards(position: { x: number; y: number }) {
    this.rotateTowards(position);

    const dx = position.x - this.position.x;
    const dy = position.y - this.position.y;
    const angle = Math.atan2(dy, dx);

    const speed = 5;
    this.position = {
      x: this.position.x + speed * Math.cos(angle),
      y: this.position.y + speed * Math.sin(angle),
    };
  }

  rotateTowards(position: { x: number; y: number }) {
    const dx = position.x - this.position.x;
    const dy = position.y - this.position.y;
    const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const angleDifference = targetAngle - this.rotation;

    // Ensure the angle difference is between -180 and 180
    let normalizedAngleDifference = ((angleDifference + 180) % 360) - 180;
    if (normalizedAngleDifference < -180) {
      normalizedAngleDifference += 360;
    }

    let speed = 30;
    // scale speed based on the angle difference
    if (Math.abs(normalizedAngleDifference) > 90) {
      speed = speed * 2;
    }

    // Calculate the amount to rotate based on the speed
    const rotationAmount = Math.sign(normalizedAngleDifference) * Math.min(Math.abs(normalizedAngleDifference), speed);

    // Apply the rotation
    this.rotation += rotationAmount;
  }
}
