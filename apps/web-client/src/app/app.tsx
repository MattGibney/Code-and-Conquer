import { useEffect, useRef, useState } from 'react';
import { GameData, Position, UnitData } from '@code-and-conquer/interfaces';
import { Button } from '@code-and-conquer/react-components';
import { drawNavigationalMesh, drawStructure, drawUnit } from '../render';

const RENDER_DEFAULTS = {
  zoom: 1.4,
  offset: { x: 0, y: 0 },
};

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
  const [zoom, setZoom] = useState<number>(RENDER_DEFAULTS.zoom);
  const [offset, setOffset] = useState<Position>(RENDER_DEFAULTS.offset);
  const [dragging, setDragging] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<Position>({ x: 0, y: 0 });

  const [isSettingWaypoints, setIsSettingWaypoints] = useState<boolean>(false);

  const [renderSettings, setRenderSettings] = useState({
    renderNavMesh: false,
    panAndZoom: false,
    boundingPolygons: false,
  });

  const [clickedPosition, setClickedPosition] = useState<Position>({ x: 0, y: 0 });

  const [viewingData, setViewingData] = useState<number | undefined>();

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
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, data.map.size.width, data.map.size.height);

      data.map.structures.forEach((structure) => {
        drawStructure(ctx, structure);
      });

      data.units.forEach((unit, unitIdx) => {
        const isViewing = (viewingData && viewingData === unitIdx) || false;
        drawUnit(ctx, unit, data.teams[0], { boundingPolygons: renderSettings.boundingPolygons}, isViewing);
      });

      if (renderSettings.renderNavMesh) {
        data.navigationalMesh.forEach((polygon) => {
          drawNavigationalMesh(ctx, polygon);
        });
      }

      if (clickedPosition) {
        ctx.beginPath();
        ctx.arc(clickedPosition.x, clickedPosition.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
      }

      ctx.restore();

      requestId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [data, offset.x, offset.y, zoom, renderSettings, viewingData, clickedPosition]);


  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const clickPos = {
      x: (event.clientX / zoom) - offset.x,
      y: (event.clientY / zoom) - offset.y,
    };

    if (isSettingWaypoints) {
      socket.current?.send(JSON.stringify({
        type: 'set-waypoint',
        position: clickPos,
      }));
      return;
    }

    if (renderSettings.panAndZoom) {
      setDragging(true);
      setLastPosition({ x: event.clientX, y: event.clientY });
      return;
    }



    console.log('Click at:', clickPos);
    setClickedPosition(clickPos);

    // Find unit with polygon within the position
    const unit = data.units.find((unit) => {
      if (!unit.boundingPolygon) return false;

      const polygon = unit.boundingPolygon;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        const intersect = ((yi > clickPos.y) !== (yj > clickPos.y)) &&
          (clickPos.x < (xj - xi) * (clickPos.y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
      }

      return inside;
    });

    if (unit) {
      const unitIdx = data.units.findIndex((u) => u.id === unit.id);
      setViewingData(unitIdx);
    } else {
      setViewingData(undefined);
    }
  };

  const handleMouseUp = () => {
    if (!renderSettings.panAndZoom) return;

    setDragging(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!renderSettings.panAndZoom) return;

    if (dragging) {
      const newPosition = { x: event.clientX, y: event.clientY };
      const dx = (newPosition.x - lastPosition.x) / zoom;
      const dy = (newPosition.y - lastPosition.y) / zoom;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setLastPosition(newPosition);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (!renderSettings.panAndZoom) return;

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
          backgroundColor: '#999999',
          margin: '0px',
          width: '60vw',
          height: '100vh',
          cursor: renderSettings.panAndZoom ? dragging ? 'grabbing' : 'grab' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      ></canvas>
      <div className='bg-white flex-1 p-4'>

        <div className="flex flex-col gap-y-8">
          <div>
            <h2 className='text-xl font-semibold'>Toggles</h2>
            <div className='flex gap-x-1'>
              <Button
                isActive={renderSettings.renderNavMesh}
                onClick={() => setRenderSettings({ ...renderSettings, renderNavMesh: !renderSettings.renderNavMesh })}
              >
                Render NavMesh
              </Button>
              <Button
                isActive={renderSettings.boundingPolygons}
                onClick={() => setRenderSettings({ ...renderSettings, boundingPolygons: !renderSettings.boundingPolygons })}
              >
                Render Bounding Polygons
              </Button>
              <Button
                isActive={renderSettings.panAndZoom}
                onClick={() => setRenderSettings({ ...renderSettings, panAndZoom: !renderSettings.panAndZoom })}
              >
                Pan / Zoom
              </Button>
            </div>
          </div>
          <div>
            <h2 className='text-xl font-semibold'>Game Actions</h2>
            <button className='bg-cyan-600 text-white px-3 py-2 rounded' onClick={() => {
              setZoom(RENDER_DEFAULTS.zoom);
              setOffset(RENDER_DEFAULTS.offset);
            }}>Reset View</button>

            <button
              className={`${isSettingWaypoints ? 'bg-cyan-800' : 'bg-cyan-600'} text-white px-3 py-2 rounded ml-2`}
              onClick={() => setIsSettingWaypoints(!isSettingWaypoints)}
            >
              {isSettingWaypoints ? 'Cancel' : 'Set Waypoints'}
            </button>
          </div>
          <div>
            <h2 className='text-xl font-semibold'>Data</h2>
            <div className="bg-gray-200 p-4 rounded-lg">
              {viewingData ? (
                <>
                  <p>ID: {data.units[viewingData].id}</p>
                  <p>Position: {data.units[viewingData].position.x}, {data.units[viewingData].position.y}</p>
                </>
              ) : (
                <>Click on a unit to view its data.</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
