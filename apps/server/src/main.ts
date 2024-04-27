import WebSocket from 'ws';

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3001 });

type Structure = {
  width: number;
  height: number;
  rotation: number;
  position: { x: number; y: number };
};

type Cliff = {
  points: { x: number; y: number }[];
}

type Unit = {
  position: { x: number; y: number };
  rotation: number;
};

type Team = {
  id: string;
  name: string;
  colour: string;
  units: Unit[];
};

type Data = {
  teams: Team[];
  map: {
    size: { width: number; height: number };
    cliffs: Cliff[];
    structures: Structure[];
  };
};


const data = {
  teams: [
    {
      id: 'TM-01HWFHTZDN3FJEDPAEJN256SZ3',
      name: 'Team 1',
      colour: 'red',
      units: [
        {
          rotation: 0,
          position: { x: 100, y: 50 },
        },
        {
          rotation: 90,
          position: { x: 115, y: 50 },
        },
      ],
    }
  ] as Team[],
  map: {
    size: { width: 500, height: 700 },
    cliffs: [
      {
        points: [
          { x: 0, y: 150 },
          { x: 100, y: 165 },
          { x: 180, y: 152 },
        ],
      },
      {
        points: [
          { x: 265, y: 75 },
          { x: 286, y: 33 },
          { x: 282, y: 0 },
        ],
      }
    ] as Cliff[],
    structures: [
      {
        width: 25,
        height: 17,
        rotation: 20,
        position: { x: 200, y: 240 },
      },
      {
        width: 20,
        height: 20,
        rotation: 35,
        position: { x: 200, y: 200 },
      }
    ] as Structure[],
  },
} as Data;




// Send data to all connected clients every second
setInterval(() => {

  data.teams[0].units[1].rotation += 5;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}, 100);

console.log('WebSocket server running on port 3001');
