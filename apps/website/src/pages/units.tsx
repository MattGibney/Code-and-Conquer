import { useEffect, useRef } from 'react';

export default function UnitsPage() {
  const tankRef = useRef<HTMLCanvasElement>(null);

  function drawTank(ctx: CanvasRenderingContext2D, position: { x: number, y: number, turrentRotation: number, bodyRotation: number }) {
    ctx.save();

    /**
     * Translate to the center of the tank
     * The tank is 110x80
     * So the center is at 55, 40
     */
    ctx.translate(position.x - 43, position.y - 62);

    // Body Rotation
    ctx.translate(43, 43);
    ctx.rotate((Math.PI / 180) * position.bodyRotation);
    ctx.translate(-43, -43);

    // Tracks
    ctx.strokeStyle = '#333333';
    ctx.beginPath();
    ctx.rect(0, 0, 20, 110);
    ctx.rect(65, 0, 20, 110);
    ctx.stroke();

    // Body
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    // ctx.rect(5, 5, 75, 100);
    ctx.moveTo(5, 5);
    ctx.lineTo(5, 65);
    ctx.lineTo(10, 105);
    ctx.lineTo(75, 105);
    ctx.lineTo(80, 65);
    ctx.lineTo(80, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    // Rotating the turret
    ctx.translate(43, 43);
    ctx.rotate((Math.PI / 180) * position.turrentRotation);
    ctx.translate(-43, -43);

    // Barrel
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.rect(40, 45, 8, 80);
    ctx.fill();
    ctx.stroke();

    // Turret
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(43, 43, 30, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.restore();
  }

  useEffect(() => {
    const canvas = tankRef.current;
    if (!canvas) return;

    const boundingRect = canvas.getBoundingClientRect();

    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawTank(
      ctx,
      {
        x: boundingRect.width / 2,
        y: boundingRect.height / 2,
        turrentRotation: 0,
        bodyRotation: 45
      }
    );


  }, [tankRef]);

  return (
    <div>
      Units

      <div>
        <h2>Tank</h2>
        <div className="flex">

          <canvas
            ref={tankRef}
            className="border"
            style={{ width: '200px', height: '200px' }}
          />

        </div>
      </div>
    </div>
  );
}
