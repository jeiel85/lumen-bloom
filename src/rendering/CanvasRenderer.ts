export interface RenderSnapshot {
  alpha: number;
  stageNameKo: string;
  stageNameEn: string;
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
      // Multiple background layers/gradients for higher quality tiers
      grad.addColorStop(0, "hsl(255, 30%, 10%)");
      grad.addColorStop(0.5, "hsl(260, 25%, 6%)");
      grad.addColorStop(1, "hsl(240, 30%, 4%)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 3. Draw ambient lighting bloom (aesthetic visual check)
    if (this.quality !== "low") {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 250);
      glowGrad.addColorStop(0, "hsla(180, 100%, 65%, 0.08)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 250, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw basic placeholder for Goal 01 (Stage Ambient text)
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Stage Korean Name
    ctx.font = "300 2.2rem 'Outfit', sans-serif";
    ctx.fillStyle = "hsla(0, 0%, 96%, 0.85)";
    ctx.shadowBlur = this.quality === "high" ? 15 : 0;
    ctx.shadowColor = "rgba(180, 255, 255, 0.4)";
    ctx.fillText(snapshot.stageNameKo, w / 2, h / 2 - 20);

    // Stage English Name
    ctx.font = "600 0.9rem 'Outfit', sans-serif";
    ctx.fillStyle = "hsla(180, 100%, 65%, 0.6)";
    ctx.shadowBlur = 0;
    ctx.fillText(snapshot.stageNameEn.toUpperCase(), w / 2, h / 2 + 25);
    ctx.restore();
  }
}
