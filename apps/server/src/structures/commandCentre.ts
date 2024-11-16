import Structure from '../structure';

export default class CommandStructure extends Structure {
  constructor(structureData, owner) {
    super(structureData, owner);
  }

  tick() {
    // Called every game tick to perform actions. This is intended to be
    // overridden by subclasses.
  }
}
