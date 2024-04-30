import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { Data, GameMap, Team } from '@code-and-conquer/interfaces';
import Map from './map';
import Unit from './unit';

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

let waypointIndex = 0;
const unit = units[0];
// Game Loop
setInterval(() => {
  const waypoints = [
    { x: 200, y: 50 },
    { x: 450, y: 680 },
    { x: 300, y: 550 },
    { x: 100, y: 550 },
  ];


  // If unit position is within 1 unit of the waypoint, move to the next waypoint
  if (Math.abs(unit.position.x - waypoints[waypointIndex].x) <= 5 && Math.abs(unit.position.y - waypoints[waypointIndex].y) <= 5) {
    waypointIndex++;
    if (waypointIndex >= waypoints.length) {
      waypointIndex = 0;
    }
  }

  // unit.rotateTowards(waypoints[waypointIndex]);
  unit.moveTowards(waypoints[waypointIndex]);
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
      } as Data;

      client.send(JSON.stringify(data));
    }
  });
}, 60);

console.log('WebSocket server running on port 3001');
