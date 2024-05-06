import { GameMap } from '@code-and-conquer/interfaces';
import Map from './map';
import path from 'path';
import fs from 'fs';
import Unit from './unit';

export default class Game {
  public map: Map;
  public units: Unit[] = [];

  public tick = 1;

  constructor(mapName: string) {
    const map = this.openGameMap(mapName);
    this.map = new Map(this, map);
  }

  tickGameLoop() {
    // console.log('Game loop tick');

    // Run for each unit
    this.units.forEach((unit) => {
      unit.run();
    });

    // Run for each structure
    // TODO: Implement structure logic


    // Update nav mesh
    const mesh = this.map.generateNavMesh();
    this.map.navMesh = mesh.navMesh;
    this.map.navMeshPolygons = mesh.navMeshPolygons;

    this.tick++;
  }

  openGameMap(mapName: string) {
    const rawGameMap = fs.readFileSync(
      path.join(__dirname, `maps/${mapName}.json`),
      'utf8'
    );
    return JSON.parse(rawGameMap) as GameMap;
  }

}
