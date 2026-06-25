import type { Vec2 } from "../domain/math/Vec2";

export class CameraTransform {
  // Convert world coordinates to screen coordinate space
  public static worldToScreen(
    worldPos: Vec2,
    cameraPos: Vec2,
    zoom: number,
    screenWidth: number,
    screenHeight: number
  ): Vec2 {
    return {
      x: (worldPos.x - cameraPos.x) * zoom + screenWidth / 2,
      y: (worldPos.y - cameraPos.y) * zoom + screenHeight / 2
    };
  }

  // Convert screen coordinates back to world coordinate space
  public static screenToWorld(
    screenPos: Vec2,
    cameraPos: Vec2,
    zoom: number,
    screenWidth: number,
    screenHeight: number
  ): Vec2 {
    return {
      x: (screenPos.x - screenWidth / 2) / zoom + cameraPos.x,
      y: (screenPos.y - screenHeight / 2) / zoom + cameraPos.y
    };
  }
}
