import type { Vec2 } from "../domain/math/Vec2";
import { CameraTransform } from "./CameraTransform";

export class BlobRenderer {
  public draw(
    ctx: CanvasRenderingContext2D,
    points: readonly Vec2[],
    playerPos: Vec2,
    cameraPos: Vec2,
    zoom: number,
    screenWidth: number,
    screenHeight: number,
    quality: "low" | "medium" | "high"
  ): void {
    if (points.length < 3) return;

    // Translate all blob boundary points into screen-space
    const screenPoints = points.map(p =>
      CameraTransform.worldToScreen(p, cameraPos, zoom, screenWidth, screenHeight)
    );

    const screenCenter = CameraTransform.worldToScreen(playerPos, cameraPos, zoom, screenWidth, screenHeight);

    ctx.save();

    // 1. Draw glowing background shadow for the blob shape
    if (quality !== "low") {
      ctx.shadowBlur = quality === "high" ? 22 : 10;
      ctx.shadowColor = "hsl(180, 100%, 65%)";
    }

    // 2. Draw organic boundary outline using quadratic bezier curves between midpoints
    ctx.beginPath();
    
    // Find first midpoint
    const firstPoint = screenPoints[0]!;
    const lastPoint = screenPoints[screenPoints.length - 1]!;
    const midX = (firstPoint.x + lastPoint.x) / 2;
    const midY = (firstPoint.y + lastPoint.y) / 2;
    
    ctx.moveTo(midX, midY);

    for (let i = 0; i < screenPoints.length; i++) {
      const pCurrent = screenPoints[i]!;
      const pNext = screenPoints[(i + 1) % screenPoints.length]!;
      
      const nextMidX = (pCurrent.x + pNext.x) / 2;
      const nextMidY = (pCurrent.y + pNext.y) / 2;
      
      // Control point is pCurrent, target is nextMid
      ctx.quadraticCurveTo(pCurrent.x, pCurrent.y, nextMidX, nextMidY);
    }
    
    ctx.closePath();

    // Calculate dynamic base radius to scale the fill radial gradient
    const approxRadius = screenPoints.reduce((acc, p) => {
      const dx = p.x - screenCenter.x;
      const dy = p.y - screenCenter.y;
      return acc + Math.sqrt(dx * dx + dy * dy);
    }, 0) / screenPoints.length;

    // 3. Render premium radial gradient filling the organic outline
    const fillGrad = ctx.createRadialGradient(
      screenCenter.x,
      screenCenter.y,
      0,
      screenCenter.x,
      screenCenter.y,
      approxRadius
    );
    fillGrad.addColorStop(0, "hsl(0, 0%, 100%)");
    fillGrad.addColorStop(0.25, "hsl(180, 100%, 85%)");
    fillGrad.addColorStop(0.7, "hsla(180, 90%, 65%, 0.45)");
    fillGrad.addColorStop(1, "hsla(180, 100%, 55%, 0.05)");

    ctx.fillStyle = fillGrad;
    ctx.fill();

    // 4. Draw a thin glowing rim stroke
    ctx.strokeStyle = "hsla(180, 100%, 80%, 0.45)";
    ctx.lineWidth = quality === "high" ? 2.5 : 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
