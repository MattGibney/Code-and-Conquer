import CommandStructure from './structures/commandCentre';
import ResourceStockpile from './structures/resourceStockpile';
import SupplyCentre from './structures/supplyCentre';


export const availablStructures = {
  ResourceStockpile,

  CommandStructure,
  SupplyCentre,
} as const;
export type StructureClass = keyof typeof availablStructures;
