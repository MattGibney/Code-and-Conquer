import { useEffect, useRef, useState } from 'react';
import { GameData, Position } from '@code-and-conquer/interfaces';
import { drawNavigationalMesh, drawStructure, drawUnit } from '../render';

export function App() {
  const socket = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<GameData>({
    teams: [],
    map: {
      size: { width: 0, height: 0 },
      structures: [],
    },
    units: [],
    navigationalMesh: [],
  });
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<Position>({ x: 0, y: 0 });

  const [isSettingWaypoints, setIsSettingWaypoints] = useState<boolean>(false);

  useEffect(() => {
    // let socket: WebSocket | null = null;
    let reconnectInterval: NodeJS.Timeout | null = null;

    const connect = () => {
      socket.current = new WebSocket('ws://localhost:3001');

      socket.current.onopen = () => {
        console.log('WebSocket connection established.');
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };

      socket.current.onmessage = (event) => {
        setData(JSON.parse(event.data));
      };

      socket.current.onclose = () => {
        console.log('WebSocket connection closed.');
        if (!reconnectInterval) {
          reconnectInterval = setInterval(connect, 1000);
        }
      };
    };

    connect();

    return () => {
      if (socket.current) {
        socket.current.close();
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

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(offset.x, offset.y);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, data.map.size.width, data.map.size.height);

      data.map.structures.forEach((structure) => {
        drawStructure(ctx, structure);
      });

      data.units.forEach((unit) => {
        drawUnit(ctx, unit, data.teams[0]);
      });

      data.navigationalMesh.forEach((polygon) => {
        drawNavigationalMesh(ctx, polygon);
      });

      ctx.restore();

      requestId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [data, offset.x, offset.y, zoom]);


  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSettingWaypoints) {
      socket.current?.send(JSON.stringify({
        type: 'set-waypoint',
        position: {
          x: (event.clientX - offset.x) / zoom,
          y: (event.clientY - offset.y) / zoom,
        },
      }));
      return;
    }

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

        <button
          className={`${isSettingWaypoints ? 'bg-cyan-800' : 'bg-cyan-600'} text-white px-3 py-2 rounded ml-2`}
          onClick={() => setIsSettingWaypoints(!isSettingWaypoints)}
        >
          {isSettingWaypoints ? 'Cancel' : 'Set Waypoints'}
        </button>

      </div>
    </div>
  );
}

export default App;
