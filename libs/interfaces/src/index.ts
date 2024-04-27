export type GameMap = {
  size: { width: number; height: number };
  cliffs: Cliff[];
  structures: Structure[];
};

export type Structure = {
  width: number;
  height: number;
  rotation: number;
  position: { x: number; y: number };
};

export type Cliff = {
  points: { x: number; y: number }[];
}

export type Unit = {
  position: { x: number; y: number };
  rotation: number;
};

export type Team = {
  id: string;
  name: string;
  colour: string;
};

export type Data = {
  teams: Team[];
  map: {
    size: { width: number; height: number };
    cliffs: Cliff[];
    structures: Structure[];
  };
  units: Unit[];
};
