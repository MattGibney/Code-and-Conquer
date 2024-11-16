import WebSocket from 'ws';
import { GameData, TeamData } from '@code-and-conquer/interfaces';
import Unit from './unit';
import Game from './game';

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3001 });



const game = new Game();
game.loadMap('test_1');



new Array(10).fill(0).forEach((_, i) => {
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
