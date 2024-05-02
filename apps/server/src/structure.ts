import { Position, StructureDefinition } from '@code-and-conquer/interfaces';
import { rectangleToPolygon } from './utils';

export default class Structure {
  public definition: StructureDefinition;
  public polygon: Position[];

  constructor(definition: StructureDefinition) {
    this.definition = definition;
    this.polygon = rectangleToPolygon(definition);
  }
}
