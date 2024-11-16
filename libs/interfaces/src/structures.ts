import { Position } from '.';

export type StructureData = {
  position: Position;
  shape: string; // SVG path
  maxHealth: number;
  maxOccupants: number;
};

