import { Data, Structure, Team, Unit } from '@code-and-conquer/interfaces';
import { useEffect, useRef, useState } from 'react';

export default function MapTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const data = {
      teams: [],
      map: {
        size: { width: 500, height: 700 },
        cliffs: [
          {
            "points": [
              { "x": 0, "y": 150 },
              { "x": 100, "y": 165 },
              { "x": 180, "y": 152 }
            ]
          },
          {
            "points": [
              { "x": 265, "y": 75 },
              { "x": 286, "y": 33 },
              { "x": 282, "y": 0 }
            ]
          }
        ],
        structures: [
          {
            "width": 25,
            "height": 17,
            "rotation": 20,
            "position": { "x": 200, "y": 240 }
          },
          {
            "width": 20,
            "height": 20,
            "rotation": 35,
            "position": { "x": 200, "y": 200 }
          }
        ],
      },
      units: [],
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let requestId: number;

    canvas.width = data.map.size.width;
    canvas.height = data.map.size.height;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Here

      requestId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} id="canvas" style={{ border: '1px solid #000', margin: '20px' }}></canvas>
    </div>
  );
}
