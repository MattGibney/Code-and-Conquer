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
  new Unit({ x: 115, y: 50 }, 90),
];

// Send data to all connected clients every second
setInterval(() => {

  // units[1].moveForward();
  units[1].rotate(10);

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
}, 100);

console.log('WebSocket server running on port 3001');
