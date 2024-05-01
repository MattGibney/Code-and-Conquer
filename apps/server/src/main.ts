import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { Data, GameMap, Position, Structure, Team } from '@code-and-conquer/interfaces';
import Map from './map';
import Unit from './unit';

// import { removeHoles } from 'poly-partition';
import { NavMeshGenerator } from 'navmesh-generator';
import { NavMesh } from 'navmesh';



// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3001 });

const rawGameMap = fs.readFileSync(
  path.join(__dirname, 'maps/test_1.json'),
  'utf8'
);
const gameMap = JSON.parse(rawGameMap) as GameMap;
const map = new Map(gameMap);

const units = [
  new Unit({ x: 100, y: 50 }, 0),
  new Unit({ x: 115, y: 50 }, 0),
];


// The main polygon (map boundary) needs to be specified anti-clockwise
// const fieldPolygon = [
//   { x: map.size.width, y: 0 },
//   { x: map.size.width, y: map.size.height },
//   { x: 0, y: map.size.height },
//   { x: 0, y: 0 },
// ];

const structurePolygons = map.structurePolygons();
// const merged = removeHoles(fieldPolygon, structurePolygons);




const areaLeftBound = 0;
const areaTopBound = 0;
const areaRightBound = map.size.width;
const areaBottomBound = map.size.height;
const rasterizationCellSize = 3;
const navMeshGenerator = new NavMeshGenerator(
  areaLeftBound,
  areaTopBound,
  areaRightBound,
  areaBottomBound,
  rasterizationCellSize
);

const obstacles = structurePolygons;
const obstacleCellPadding = 3;
const navMeshPolygons = navMeshGenerator.buildNavMesh(
  obstacles,
  obstacleCellPadding
);

const navMesh = new NavMesh(navMeshPolygons);


let waypointIndex = 0;
const waypoints = [
  { x: 200, y: 50 },
  { x: 450, y: 680 },
  { x: 300, y: 550 },
  { x: 100, y: 550 },
];

let pathIndex = 0;
let navPath: Position[] = [];

const unit = units[0];
// Game Loop
setInterval(() => {

  // If unit position is within 1 unit of the waypoint, move to the next waypoint
  if (Math.abs(unit.position.x - waypoints[waypointIndex].x) <= 5 && Math.abs(unit.position.y - waypoints[waypointIndex].y) <= 5) {
    waypointIndex++;
    if (waypointIndex >= waypoints.length) {
      waypointIndex = 0;
    }
  }

  if (navPath.length > 0) {
    if (Math.abs(unit.position.x - navPath[pathIndex].x) <= 5 && Math.abs(unit.position.y - navPath[pathIndex].y) <= 5) {
      pathIndex++;
      if (pathIndex >= navPath.length) {
        pathIndex = 0;
        navPath = [];
      }
    }
  }

  if (navPath.length === 0 || pathIndex >= navPath.length) {
    navPath = navMesh.findPath(units[0].position, waypoints[waypointIndex]);
    pathIndex = 0;
  }

  // unit.rotateTowards(waypoints[waypointIndex]);
  unit.moveTowards(navPath[pathIndex]);
}, 60);



// Send data to all connected clients every second
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const data = {
        teams: [
          {
            id: 'TM-01HWFHTZDN3FJEDPAEJN256SZ3',
            name: 'Team 1',
            colour: 'red',
          }
        ] as Team[],
        map: map.serialize(),
        units: units.map((unit) => unit.serialize()),

        navigationalMesh: navMeshPolygons,
      } as Data;

      client.send(JSON.stringify(data));
    }
  });
}, 60);

console.log('WebSocket server running on port 3001');
