import { GameMap } from '@code-and-conquer/interfaces';
import { VertexArray, NavMeshGenerator } from 'navmesh-generator';
import { NavMesh } from 'navmesh';
import Structure from './structure';

export default class Map {
  public size: { width: number; height: number };
  public structures: Structure[];

  public navMeshPolygons: VertexArray[] = [];
  public navMesh: NavMesh | undefined;

  constructor(gameMap: GameMap) {
    this.size = gameMap.size;
    this.structures = gameMap.structures.map((definition) => new Structure(definition));

    this.generateNavMesh();
  }

  serialize() {
    const structurePolygons = this.structures.map((structure) => structure.polygon);
    return {
      size: this.size,
      structures: structurePolygons,
    };
  }

  findPath(start: { x: number; y: number }, end: { x: number; y: number }) {
    if (!this.navMesh) return [];
    return this.navMesh.findPath(start, end);
  }

  generateNavMesh() {
    const areaLeftBound = 0;
    const areaTopBound = 0;
    const areaRightBound = this.size.width;
    const areaBottomBound = this.size.height;
    const rasterizationCellSize = 3;
    const navMeshGenerator = new NavMeshGenerator(
      areaLeftBound,
      areaTopBound,
      areaRightBound,
      areaBottomBound,
      rasterizationCellSize
    );

    const obstacles = this.structures.map((structure) => structure.polygon);
    const obstacleCellPadding = 3;
    const navMeshPolygons = navMeshGenerator.buildNavMesh(
      obstacles,
      obstacleCellPadding
    );

    this.navMeshPolygons = navMeshPolygons;
    this.navMesh = new NavMesh(navMeshPolygons);
  }
}
