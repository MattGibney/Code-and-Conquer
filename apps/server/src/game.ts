import { GameMap } from '@code-and-conquer/interfaces';
import Map from './map';
import path from 'path';
import fs from 'fs';
import Unit from './unit';

export default class Game {
  public map: Map;
  public units: Unit[] = [];

  public tick = 1;

  tickGameLoop() {
    // console.log('Game loop tick');

    // Run for each unit
    this.units.forEach((unit) => {
      unit.run();
    });

    // Run for each structure
    // TODO: Implement structure logic


    // Update nav mesh
    if (this.map) {
      this.map.updateNavMesh();
    }

    this.tick++;
  }

  loadMap(mapName: string) {
    const map = this.openGameMap(mapName);
    this.map = new Map(this, map);
  }

  openGameMap(mapName: string) {
    const rawGameMap = fs.readFileSync(
      path.join(__dirname, `maps/${mapName}.json`),
      'utf8'
    );
    return JSON.parse(rawGameMap) as GameMap;
  }
}
