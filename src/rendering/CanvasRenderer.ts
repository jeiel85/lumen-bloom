import type { Vec2 } from "../domain/math/Vec2";
import { CameraTransform } from "./CameraTransform";
import { BlobRenderer } from "./BlobRenderer";
import type { Mote } from "../domain/entities/Mote";

export interface RenderSnapshot {
  alpha: number;
  stageNameKo: string;
  stageNameEn: string;
  player?: {
    position: Vec2;
    mass: number;
    blobPoints: readonly Vec2[];
  };
  camera?: {
    position: Vec2;
    zoom: number;
  };
  motes?: readonly Mote[];
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  private quality: "low" | "medium" | "high" = "medium";
  private blobRenderer: BlobRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context");
    }
    this.ctx = context;
    this.blobRenderer = new BlobRenderer();
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
      glowGrad.addColorStop(0, "hsla(180, 100%, 65%, 0.05)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 250, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Render Active Motes (Food particles)
    if (snapshot.motes && snapshot.camera) {
      const zoom = snapshot.camera.zoom;
      const cameraPos = snapshot.camera.position;
      
      ctx.save();
      for (const mote of snapshot.motes) {
        if (mote.state === "consumed") continue;

        const screenPos = CameraTransform.worldToScreen(mote.position, cameraPos, zoom, w, h);
        const radius = Math.sqrt(mote.mass) * 3 * zoom;

        // Basic boundary cull check
        if (
          screenPos.x < -radius * 2 ||
          screenPos.x > w + radius * 2 ||
          screenPos.y < -radius * 2 ||
          screenPos.y > h + radius * 2
        ) {
          continue;
        }

        // Draw mote particle with distinct states styling
        if (mote.state === "magnetized") {
          // Draw a small tail pointing away from player direction
          if (this.quality !== "low" && snapshot.player) {
            const playerScreenPos = CameraTransform.worldToScreen(snapshot.player.position, cameraPos, zoom, w, h);
            const dx = playerScreenPos.x - screenPos.x;
            const dy = playerScreenPos.y - screenPos.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              const tailX = screenPos.x - (dx / len) * radius * 3.5;
              const tailY = screenPos.y - (dy / len) * radius * 3.5;
              
              const tailGrad = ctx.createLinearGradient(screenPos.x, screenPos.y, tailX, tailY);
              tailGrad.addColorStop(0, "hsla(180, 100%, 75%, 0.8)");
              tailGrad.addColorStop(1, "hsla(180, 100%, 55%, 0.0)");
              
              ctx.strokeStyle = tailGrad;
              ctx.lineWidth = radius * 1.5;
              ctx.lineCap = "round";
              ctx.beginPath();
              ctx.moveTo(screenPos.x, screenPos.y);
              ctx.lineTo(tailX, tailY);
              ctx.stroke();
            }
          }
        }

        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
        
        const moteGrad = ctx.createRadialGradient(
          screenPos.x,
          screenPos.y,
          0,
          screenPos.x,
          screenPos.y,
          radius
        );

        if (mote.state === "merging") {
          // Fade and blend orange as it merges
          const alphaFade = 1.0 - Math.min(mote.mergeElapsed / mote.mergeDuration, 1.0);
          ctx.globalAlpha = alphaFade;
          moteGrad.addColorStop(0, "hsl(50, 100%, 95%)");
          moteGrad.addColorStop(0.3, "hsl(40, 100%, 75%)");
          moteGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
        } else {
          // Standard idle/magnetized white-cyan neon light
          ctx.globalAlpha = 1.0;
          if (this.quality !== "low") {
            ctx.shadowBlur = this.quality === "high" ? 10 : 5;
            ctx.shadowColor = "hsl(180, 100%, 75%)";
          }
          moteGrad.addColorStop(0, "hsl(0, 0%, 100%)");
          moteGrad.addColorStop(0.4, "hsl(180, 100%, 90%)");
          moteGrad.addColorStop(1, "hsla(180, 100%, 65%, 0.1)");
        }

        ctx.fillStyle = moteGrad;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
        ctx.globalAlpha = 1.0; // Reset
      }
      ctx.restore();
    }

    // 5. Render Organic Player Deformed Blob
    if (snapshot.player && snapshot.camera) {
      this.blobRenderer.draw(
        ctx,
        snapshot.player.blobPoints,
        snapshot.player.position,
        snapshot.camera.position,
        snapshot.camera.zoom,
        w,
        h,
        this.quality
      );
    }

    // 6. Draw stage ambient texts
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
