import { MapData } from '@code-and-conquer/interfaces';

const mapData: MapData = {
  name: 'Map 1',
  structures: [
    {
      type: 'ResourceStockpile',
      position: { x: 100, y: 100, rotation: 0 },
      shape: '',
      maxHealth: -1,
      maxOccupants: 0,
      resources: 50000,
    }
  ],
  terrain: {
    height: 1000,
    width: 600,
    obstacles: [],
  },
};

export default mapData;
