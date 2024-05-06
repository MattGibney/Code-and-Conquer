import { GameMap, Position } from '@code-and-conquer/interfaces';
import { VertexArray, NavMeshGenerator } from 'navmesh-generator';
import { NavMesh } from 'navmesh';
import Structure from './structure';
import Game from './game';
import Unit from './unit';

export default class Map {
  public game: Game;
  public size: { width: number; height: number };
  public structures: Structure[];

  public navMeshPolygons: VertexArray[] = [];
  public navMesh: NavMesh | undefined;

  constructor(game: Game, gameMap: GameMap) {
    this.game = game;
    this.size = gameMap.size;
    this.structures = gameMap.structures.map((definition) => new Structure(definition));
  }

  serialize() {
    const structurePolygons = this.structures.map((structure) => structure.polygon);
    return {
      size: this.size,
      structures: structurePolygons,
    };
  }

  findPath(start: Position, end: Position, navMeshOverride?: NavMesh) {
    if (!this.navMesh && !navMeshOverride) return [];

    const navMesh = navMeshOverride || this.navMesh;
    return navMesh.findPath(start, end);
  }

  findAlternatePath(unit: Unit) {
    // Find Units within a certain radius
    const nearbyUnits = this.game.units.filter((otherUnit) => {
      if (otherUnit === unit) return false;
      const distance = Math.sqrt(
        Math.pow(otherUnit.position.x - unit.position.x, 2) +
          Math.pow(otherUnit.position.y - unit.position.y, 2)
      );

      return distance < 20;
    });
    const nearbyUnitsPolygons = nearbyUnits.map((otherUnit) => otherUnit.boundingPolygon);

    // Generate a new nav mesh with the additional obstacles
    const mesh = this.generateNavMesh(nearbyUnitsPolygons, 0);

    return mesh.navMesh.findPath(unit.position, unit.targetPosition);
  }

  generateNavMesh(additionalObstacles: Position[][] = [], obstacleCellPadding = 3): { navMeshPolygons: VertexArray[]; navMesh: NavMesh } {
    this.game.units.forEach((unit) => {
      unit.updateBoundingPolygon();
    });

    const areaLeftBound = 0;
    const areaTopBound = 0;
    const areaRightBound = this.size.width;
    const areaBottomBound = this.size.height;
    const rasterizationCellSize = 2;
    const navMeshGenerator = new NavMeshGenerator(
      areaLeftBound,
      areaTopBound,
      areaRightBound,
      areaBottomBound,
      rasterizationCellSize
    );

    const structures = this.structures.map((structure) => structure.polygon);

    const navMeshPolygons = navMeshGenerator.buildNavMesh(
      [structures, additionalObstacles].flat(),
      obstacleCellPadding
    );

    return { navMeshPolygons, navMesh: new NavMesh(navMeshPolygons) };
  }


  isPositionOccupied(currentUnit: Unit, targetPosition: Position) {
    const targetBoundingBox = {
      x: targetPosition.x - currentUnit.unitRadius,
      y: targetPosition.y - currentUnit.unitRadius,
      width: currentUnit.unitRadius * 2,
      height: currentUnit.unitRadius * 2,
    };

    return this.game.units
      .filter((unit) => unit !== currentUnit)
      .some((otherUnit) => {
        const otherUnitBoundingBox = otherUnit.getBoundingBox();

        return this.isBoundingBoxOverlap(targetBoundingBox, otherUnitBoundingBox);
      });
  }

  isBoundingBoxOverlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
