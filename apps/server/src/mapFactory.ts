import map_1 from './maps/map_1';

export const availableMaps = {
  map_1,
} as const;
export type MapName = keyof typeof availableMaps;
