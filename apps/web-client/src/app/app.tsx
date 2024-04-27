import { useEffect, useState } from 'react';

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

export function App() {
  useEffect(() => {
    let data = {
      teams: [],
      map: {
        size: { width: 0, height: 0 },
        cliffs: [],
        structures: [],
      },
    } as Data;

    const socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
      data = event.data;
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    // const data = {
    //   teams: [
    //     {
    //       id: 'TM-01HWFHTZDN3FJEDPAEJN256SZ3',
    //       name: 'Team 1',
    //       colour: 'red',
    //       units: [
    //         {
    //           rotation: 0,
    //           position: { x: 100, y: 50 },
    //         },
    //         {
    //           rotation: 90,
    //           position: { x: 115, y: 50 },
    //         },
    //       ],
    //     }
    //   ] as Team[],
    //   map: {
    //     size: { width: 500, height: 700 },
    //     cliffs: [
    //       {
    //         points: [
    //           { x: 0, y: 150 },
    //           { x: 100, y: 165 },
    //           { x: 180, y: 152 },
    //         ],
    //       },
    //       {
    //         points: [
    //           { x: 265, y: 75 },
    //           { x: 286, y: 33 },
    //           { x: 282, y: 0 },
    //         ],
    //       }
    //     ] as Cliff[],
    //     structures: [
    //       {
    //         width: 25,
    //         height: 17,
    //         rotation: 20,
    //         position: { x: 200, y: 240 },
    //       },
    //       {
    //         width: 20,
    //         height: 20,
    //         rotation: 35,
    //         position: { x: 200, y: 200 },
    //       }
    //     ] as Structure[],
    //   },
    // } as Data;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const drawUnit = (unit: Unit, team: Team) => {
      ctx.resetTransform();

      ctx.save();
      ctx.translate(unit.position.x, unit.position.y);
      ctx.rotate((Math.PI / 180) * unit.rotation);
      ctx.translate(-unit.position.x, -unit.position.y);

      ctx.beginPath();
      ctx.arc(unit.position.x, unit.position.y, 4, 0, 2 * Math.PI);
      ctx.strokeStyle = team.colour;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(unit.position.x, unit.position.y);
      ctx.lineTo(unit.position.x, unit.position.y - 10);
      ctx.stroke();

      ctx.restore();
    };

    canvas.width = data.map.size.width;
    canvas.height = data.map.size.height;

    const drawStructure = (structure: Structure) => {
      const centrePoint = {
        x: structure.position.x + structure.width / 2,
        y: structure.position.y + structure.height / 2,
      };

      ctx.resetTransform();
      ctx.beginPath();

      ctx.save();
      ctx.translate(centrePoint.x, centrePoint.y);
      ctx.rotate((Math.PI / 180) * structure.rotation);
      ctx.translate(-centrePoint.x, -centrePoint.y);
      ctx.rect(structure.position.x, structure.position.y, structure.width, structure.height);
      ctx.strokeStyle = '#999999';
      ctx.stroke();

      // ctx.beginPath();
      // ctx.arc(centrePoint.x, centrePoint.y, 1, 0, 2 * Math.PI);
      // ctx.strokeStyle = 'black';
      // ctx.stroke();
      ctx.restore();
    }

    const drawCliff = (cliff: Cliff) => {
      ctx.save();
      ctx.beginPath();
      cliff.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#A8A68F';
      ctx.stroke();
      ctx.restore();
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      data.map.cliffs.forEach((cliff) => {
        drawCliff(cliff);
      });

      data.map.structures.forEach((structure) => {
        drawStructure(structure);
      });

      data.teams.forEach((team) => {

        team.units.forEach((unit) => {
          drawUnit(unit, team);
        });
      });

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);

    return () => {
      socket.close();
    };
  }, []);


  return (
    <div>
      <canvas id="canvas" style={{ border: '1px solid #000', margin: '20px' }}></canvas>
    </div>
  );
}

export default App;
