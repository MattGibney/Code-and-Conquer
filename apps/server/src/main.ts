import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { GameData, GameMap, TeamData } from '@code-and-conquer/interfaces';
import Map from './map';
import Unit from './unit';
import Game from './game';

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3001 });



const game = new Game('test_1');



new Array(100).fill(0).forEach((_, i) => {
  const x = 50 + (i % 40) * 10;
  const y = 50 + Math.floor(i / 40) * 10;
  game.units.push(
    new Unit(
      game,
      { x, y },
      0
    )
  );
});



setInterval(() => {
  game.tickGameLoop();
}, 60);

// const rawGameMap = fs.readFileSync(
//   path.join(__dirname, 'maps/test_1.json'),
//   'utf8'
// );
// const gameMap = JSON.parse(rawGameMap) as GameMap;

// export interface Game {
//   map: Map;
//   units: Unit[];
// }

// const game: Game = {
//   map: null as Map,
//   units: [],
// };

// game.map = new Map(game, gameMap);

// new Array(100).fill(0).forEach((_, i) => {
//   const x = 50 + (i % 40) * 10;
//   const y = 50 + Math.floor(i / 40) * 10;
//   game.units.push(
//     new Unit(
//       game,
//       { x, y },
//       0
//     )
//   );
// });

// let waypointIndex = 0;
// const waypoints = [
//   { x: 250, y: 600 },
//   { x: 50, y: 50 },
//   { x: 250, y: 300 },
// ];

// Game Loop
// setInterval(() => {
//   game.map.generateNavMesh();

//   game.units.forEach((unit) => {
//     // If unit position is within 1 unit of the waypoint, move to the next waypoint
//     if (Math.abs(unit.position.x - waypoints[waypointIndex].x) <= 5 && Math.abs(unit.position.y - waypoints[waypointIndex].y) <= 5) {
//       waypointIndex++;
//       if (waypointIndex >= waypoints.length) {
//         waypointIndex = 0;
//       }
//     }

//     if (unit.navPath && unit.navPath.length === 0) {
//       unit.setTargetPosition(waypoints[waypointIndex]);
//     }
//   });

//   game.units.forEach((unit) => {
//     unit.run();
//   });
// }, 60);



// listen to messages from clients
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // console.log('received: %s', message);
      const parsedMessage = JSON.parse(message.toString());
      if (parsedMessage.type === 'set-waypoint') {
        game.units.forEach((unit) => {
          unit.setTargetPosition(parsedMessage.position);
        });
      }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});



// Send data to all connected clients every second
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const data = {
        teams: [
          {
            id: 'TM-01HWFHTZDN3FJEDPAEJN256SZ3',
            name: 'Team 1',
            colour: '#d95300',
          }
        ] as TeamData[],
        map: game.map.serialize(),
        units: game.units.map((unit) => unit.serialize()),

        navigationalMesh: game.map.navMeshPolygons,
      } as GameData;

      client.send(JSON.stringify(data));
    }
  });
}, 60);

console.log('WebSocket server running on port 3001');
