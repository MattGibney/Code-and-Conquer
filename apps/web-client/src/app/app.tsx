import { useEffect, useRef, useState } from 'react';
import { Data, Position, Team, Unit } from '@code-and-conquer/interfaces';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<Data>({
    teams: [],
    map: {
      size: { width: 0, height: 0 },
      structures: [],
    },
    units: [],
    navigationalMesh: [],
  });

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectInterval: NodeJS.Timeout | null = null;

    const connect = () => {
      socket = new WebSocket('ws://localhost:3001');

      socket.onopen = () => {
        console.log('WebSocket connection established.');
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };

      socket.onmessage = (event) => {
        setData(JSON.parse(event.data));
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed.');
        if (!reconnectInterval) {
          reconnectInterval = setInterval(connect, 1000);
        }
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let requestId: number;

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
      ctx.lineTo(unit.position.x + 10, unit.position.y);
      ctx.stroke();

      ctx.restore();
    };

    canvas.width = data.map.size.width;
    canvas.height = data.map.size.height;

    const drawStructure = (structure: Position[]) => {
      ctx.save();

      ctx.beginPath();
      structure.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = '#999999';
      ctx.stroke();

      ctx.restore();


      // const centrePoint = {
      //   x: structure.position.x + structure.width / 2,
      //   y: structure.position.y + structure.height / 2,
      // };

      // ctx.resetTransform();
      // ctx.beginPath();

      // ctx.save();
      // ctx.translate(centrePoint.x, centrePoint.y);
      // ctx.rotate((Math.PI / 180) * structure.rotation);
      // ctx.translate(-centrePoint.x, -centrePoint.y);
      // ctx.rect(structure.position.x, structure.position.y, structure.width, structure.height);
      // ctx.strokeStyle = '#999999';
      // ctx.stroke();

      // // ctx.beginPath();
      // // ctx.arc(centrePoint.x, centrePoint.y, 1, 0, 2 * Math.PI);
      // // ctx.strokeStyle = 'black';
      // // ctx.stroke();
      // ctx.restore();
    }

    const drawNavigationalMesh = (navigationalMesh: { x: number; y: number }[]) => {
      ctx.save();
      ctx.beginPath();
      navigationalMesh.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'blue';
      ctx.fillStyle = '#0000FF11';
      ctx.stroke();
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      data.map.structures.forEach((structure) => {
        drawStructure(structure);
      });


      data.units.forEach((unit) => {
        drawUnit(unit, data.teams[0]);
      });

      data.navigationalMesh.forEach((polygon) => {
        drawNavigationalMesh(polygon);
      });

      requestId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [data]);



  return (
    <div>
      <canvas ref={canvasRef} id="canvas" style={{ border: '1px solid #000', margin: '20px' }}></canvas>
    </div>
  );
}

export default App;
