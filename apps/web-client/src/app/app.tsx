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
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

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
      // ctx.resetTransform();

      ctx.save();
      ctx.translate(unit.position.x, unit.position.y);
      ctx.rotate((Math.PI / 180) * unit.rotation);
      ctx.translate(-unit.position.x, -unit.position.y);

      ctx.beginPath();
      ctx.arc(unit.position.x, unit.position.y, 4, 0, 2 * Math.PI);
      ctx.strokeStyle = team.colour;
      ctx.fillStyle = `${team.colour}33`;
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(unit.position.x, unit.position.y);
      ctx.lineTo(unit.position.x + 10, unit.position.y);
      ctx.stroke();

      ctx.restore();
    };

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

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
      ctx.fillStyle = '#99999911';
      ctx.stroke();
      ctx.fill();

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

    // const drawNavigationalMesh = (navigationalMesh: { x: number; y: number }[]) => {
    //   ctx.save();
    //   ctx.beginPath();
    //   navigationalMesh.forEach((point, index) => {
    //     if (index === 0) {
    //       ctx.moveTo(point.x, point.y);
    //     } else {
    //       ctx.lineTo(point.x, point.y);
    //     }
    //   });
    //   ctx.lineWidth = 1;
    //   ctx.strokeStyle = 'blue';
    //   ctx.fillStyle = '#0000FF11';
    //   ctx.stroke();
    //   ctx.fill();

    //   ctx.restore();
    // };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(offset.x, offset.y);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, data.map.size.width, data.map.size.height);

      data.map.structures.forEach((structure) => {
        drawStructure(structure);
      });

      data.units.forEach((unit) => {
        drawUnit(unit, data.teams[0]);
      });

      // data.navigationalMesh.forEach((polygon) => {
      //   drawNavigationalMesh(polygon);
      // });

      ctx.restore();

      requestId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [data, offset.x, offset.y, zoom]);


  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(true);
    setLastPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) {
      const newPosition = { x: event.clientX, y: event.clientY };
      const dx = (newPosition.x - lastPosition.x) / zoom;
      const dy = (newPosition.y - lastPosition.y) / zoom;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setLastPosition(newPosition);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    const zoomFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoom(zoom * zoomFactor);
  };

  return (
    <div className='flex'>
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{
          border: '1px solid #00000022',
          backgroundColor: '#ffffff',
          margin: '0px',
          width: '60vw',
          height: '100vh',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      ></canvas>
      <div className='bg-zinc-100 flex-1 p-4'>

        <button className='bg-cyan-600 text-white px-3 py-2 rounded' onClick={() => {
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        }}>Reset View</button>

      </div>
    </div>
  );
}

export default App;
