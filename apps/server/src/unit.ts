export default class Unit {
  public position: { x: number; y: number };
  public rotation: number;

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

  moveForward() {
    const speed =  5;
    const angle = (Math.PI / 180) * this.rotation;
    this.position = {
      x: this.position.x + speed * Math.sin(angle),
      y: this.position.y - speed * Math.cos(angle),
    };
  }

  rotate(degrees: number) {
    this.rotation += degrees;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
  }
}
