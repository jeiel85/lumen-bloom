import type { Vec2 } from "../domain/math/Vec2";
import { CameraTransform } from "./CameraTransform";

export interface RenderSnapshot {
  alpha: number;
  stageNameKo: string;
  stageNameEn: string;
  player?: {
    position: Vec2;
    mass: number;
  };
  camera?: {
    position: Vec2;
    zoom: number;
  };
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  private quality: "low" | "medium" | "high" = "medium";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context");
    }
    this.ctx = context;
  }

  public getDpr(): number {
    return this.dpr;
  }

  public resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;

    // Apply physical size
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    // Scale context back to CSS size
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    this.ctx.scale(dpr, dpr);
  }

  public setQuality(quality: "low" | "medium" | "high"): void {
    this.quality = quality;
    console.log(`[CanvasRenderer] Quality tier set to: ${quality}`);
  }

  public render(snapshot: RenderSnapshot): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Clear background
    ctx.clearRect(0, 0, w, h);

    // 2. Draw deep space background gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h));
    if (this.quality === "low") {
      grad.addColorStop(0, "hsl(260, 25%, 8%)");
      grad.addColorStop(1, "hsl(240, 30%, 4%)");
    } else {
      grad.addColorStop(0, "hsl(255, 30%, 10%)");
      grad.addColorStop(0.5, "hsl(260, 25%, 6%)");
      grad.addColorStop(1, "hsl(240, 30%, 4%)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 3. Draw ambient lighting bloom
    if (this.quality !== "low") {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 250);
      glowGrad.addColorStop(0, "hsla(180, 100%, 65%, 0.06)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 250, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Render Player if active in game
    if (snapshot.player && snapshot.camera) {
      ctx.save();
      
      // Calculate screen coordinate for player
      const screenPos = CameraTransform.worldToScreen(
        snapshot.player.position,
        snapshot.camera.position,
        snapshot.camera.zoom,
        w,
        h
      );

      // Mass-based radius calculation: radius = sqrt(mass) * scaleFactor
      const radius = Math.sqrt(snapshot.player.mass) * 8 * snapshot.camera.zoom;

      // Glow effect under player
      if (this.quality !== "low") {
        ctx.shadowBlur = this.quality === "high" ? 25 : 12;
        ctx.shadowColor = "hsl(180, 100%, 65%)";
      }

      // Draw aesthetic outer halo ring
      if (this.quality === "high") {
        ctx.strokeStyle = "hsla(180, 100%, 75%, 0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Fill player light blob
      const playerGlow = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        radius
      );
      playerGlow.addColorStop(0, "hsl(0, 0%, 100%)");
      playerGlow.addColorStop(0.3, "hsl(180, 100%, 85%)");
      playerGlow.addColorStop(1, "hsla(180, 100%, 60%, 0.15)");
      
      ctx.fillStyle = playerGlow;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 5. Draw stage ambient texts (rendered in world space or centered on screen depending on layout)
    // For Goal 01/02 we center it in CSS pixels on screen with a light ambient touch
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Stage Korean Name
    ctx.font = "300 2.2rem 'Outfit', sans-serif";
    ctx.fillStyle = "hsla(0, 0%, 96%, 0.7)";
    ctx.shadowBlur = this.quality === "high" ? 15 : 0;
    ctx.shadowColor = "rgba(180, 255, 255, 0.4)";
    ctx.fillText(snapshot.stageNameKo, w / 2, h / 2 - 20);

    // Stage English Name
    ctx.font = "600 0.9rem 'Outfit', sans-serif";
    ctx.fillStyle = "hsla(180, 100%, 65%, 0.5)";
    ctx.shadowBlur = 0;
    ctx.fillText(snapshot.stageNameEn.toUpperCase(), w / 2, h / 2 + 25);
    ctx.restore();
  }
}
