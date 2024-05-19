import { Position, TeamData, UnitData } from '@code-and-conquer/interfaces';

export function drawUnit(ctx: CanvasRenderingContext2D, unit: UnitData, team: TeamData, renderSettings: { boundingPolygons: boolean }, isViewing: boolean) {
  ctx.save();
  ctx.translate(unit.position.x, unit.position.y);
  ctx.rotate((Math.PI / 180) * unit.rotation);
  ctx.translate(-unit.position.x, -unit.position.y);

  ctx.beginPath();
  ctx.arc(unit.position.x, unit.position.y, 4, 0, 2 * Math.PI);
  ctx.lineWidth = .5;
  ctx.strokeStyle = team.colour;
  ctx.fillStyle = `${team.colour}33`;
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(unit.position.x, unit.position.y);
  ctx.lineTo(unit.position.x + 10, unit.position.y);
  ctx.stroke();

  ctx.restore();

  if (isViewing) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(unit.position.x, unit.position.y, 8, 0, 2 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = team.colour;
    ctx.stroke();
    ctx.restore();
  }

  if (renderSettings.boundingPolygons) {
    ctx.beginPath();
    unit.boundingPolygon.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.lineWidth = .5;
    ctx.strokeStyle = `${team.colour}`;
    ctx.stroke();
  }

  if (unit.navigationPath && unit.navigationPath.length > 0) {
    ctx.save();

    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    unit.navigationPath.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = `${team.colour}66`;
    ctx.stroke();

    ctx.restore();
  }
}

export function drawStructure(ctx: CanvasRenderingContext2D, structure: Position[]) {
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
}

export function drawNavigationalMesh(ctx: CanvasRenderingContext2D, navigationalMesh: Position[]) {
  ctx.save();
  ctx.beginPath();
  navigationalMesh.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.lineWidth = .25;
  ctx.strokeStyle = 'blue';
  ctx.fillStyle = '#0000FF11';
  ctx.stroke();
  ctx.fill();

  ctx.restore();
}
