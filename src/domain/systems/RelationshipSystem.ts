import type { GameState, UpdateContext } from "../state/types";
import type { GameConfig } from "../../config/types";

export type Relationship = "edible" | "contested" | "threat";

export class RelationshipSystem {
  // Evaluates relative relationship between player and an entity using hysteresis bounds
  public static evaluate(
    playerMass: number,
    entityMass: number,
    currentRelation: Relationship,
    config: GameConfig
  ): Relationship {
    const ratio = entityMass / playerMass;
    const edibleEnter = config.relationship?.edibleEnterRatio || 0.9;
    const edibleExit = config.relationship?.edibleExitRatio || 0.94;
    const threatEnter = config.relationship?.threatEnterRatio || 1.12;
    const threatExit = config.relationship?.threatExitRatio || 1.07;

    if (currentRelation === "edible") {
      if (ratio > edibleExit) {
        return "contested";
      }
      return "edible";
    }

    if (currentRelation === "threat") {
      if (ratio < threatExit) {
        return "contested";
      }
      return "threat";
    }

    // Contested (middle state) transition checks
    if (ratio < edibleEnter) {
      return "edible";
    }
    if (ratio > threatEnter) {
      return "threat";
    }

    return "contested";
  }

  public update(_state: GameState, _context: UpdateContext): void {
    // Relationship systems update state policies if entities have dynamic relationships.
    // For static motes, relationship is evaluated in absorption system triggers.
  }
}
