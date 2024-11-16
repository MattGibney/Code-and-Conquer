import SupplyTransport from './units/supplyTransport';

export const availablUnits = {
  SupplyTransport,
} as const;
export type UnitClass = keyof typeof availablUnits;
