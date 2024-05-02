import { Position, StructureDefinition } from '@code-and-conquer/interfaces';

export function rectangleToPolygon(rectangle: StructureDefinition): Position[] {
  const { width, height, rotation, position } = rectangle;
  const vertices: Position[] = [];

  // Define rectangle vertices
  const topLeft: Position = { x: -width / 2, y: -height / 2 };
  const topRight: Position = { x: width / 2, y: -height / 2 };
  const bottomRight: Position = { x: width / 2, y: height / 2 };
  const bottomLeft: Position = { x: -width / 2, y: height / 2 };

  // Apply rotation to each vertex
  const theta = rotation * (Math.PI / 180); // Convert degrees to radians
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  function rotateVertex(vertex: Position): Position {
    // Translate the vertex to the origin
    const translatedX = vertex.x - position.x;
    const translatedY = vertex.y - position.y;

    // Perform the rotation
    const rotatedX = translatedX * cosTheta - translatedY * sinTheta;
    const rotatedY = translatedX * sinTheta + translatedY * cosTheta;

    // Translate the vertex back
    const finalX = rotatedX + position.x;
    const finalY = rotatedY + position.y;

    return { x: finalX, y: finalY };
}

  vertices.push(
    rotateVertex({
      x: bottomLeft.x + position.x,
      y: bottomLeft.y + position.y,
    }),
    rotateVertex({
      x: bottomRight.x + position.x,
      y: bottomRight.y + position.y,
    }),
    rotateVertex({
      x: topRight.x + position.x,
      y: topRight.y + position.y,
    }),
    rotateVertex({
      x: topLeft.x + position.x,
      y: topLeft.y + position.y,
    }),
  );

  return vertices;
}
