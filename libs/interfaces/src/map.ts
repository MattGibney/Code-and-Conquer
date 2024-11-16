import { Position } from '.';

export type MapData = {
  name: string;
  structures: MapStructureData[];
  terrain: {
    width: number;
    height: number;
    obstacles: {
      position: Position;
      shape: string;
    }[];
  };
}

export type MapStructureData = ResourceStockpileData;

type BaseStructureData = {
  position: Position;
  shape: string;
  maxHealth: number;
  maxOccupants: number;
};

export type ResourceStockpileData = BaseStructureData &{
  type: 'ResourceStockpile';
  resources: number;
}
