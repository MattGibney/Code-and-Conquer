export type Position = {
  x: number;
  y: number;
}

export type GameMap = {
  size: { width: number; height: number };
  structures: StructureDefinition[];
};

export type StructureDefinition = {
  width: number;
  height: number;
  rotation: number;
  position: Position;
};

export type UnitData = {
  position: Position;
  rotation: number;
  navigationPath: Position[];
  boundingPolygon: Position[];
};

export type TeamData = {
  id: string;
  name: string;
  colour: string;
};

export type GameData = {
  teams: TeamData[];
  map: {
    size: { width: number; height: number };
    structures: Position[][];
  };
  units: UnitData[];
  navigationalMesh: Position[][];
};
