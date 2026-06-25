import Ajv2020 from "ajv/dist/2020";
import type { GameConfig } from "./types";

// Import raw configs
import balanceJson from "../../config/balance.config.json";
import stagesJson from "../../config/stages.config.json";
import enemiesJson from "../../config/enemies.config.json";
import traitsJson from "../../config/traits.config.json";

// Import schemas
import balanceSchema from "../../schemas/balance.schema.json";

// Define strict fallback configuration
export const SAFE_DEFAULTS: GameConfig = {
  schemaVersion: 1,
  simulation: {
    fixedHz: 60,
    maxFrameDeltaSeconds: 0.1,
    maxStepsPerFrame: 5
  },
  movement: {
    maxScreenSpeed: 260,
    accelerationResponseSeconds: 0.35,
    coastToTenPercentSeconds: 0.8,
    cameraLookAheadFraction: 0.06
  },
  relationship: {
    edibleEnterRatio: 0.9,
    edibleExitRatio: 0.94,
    threatEnterRatio: 1.12,
    threatExitRatio: 1.07
  },
  absorption: {
    magnetRadiusMultiplier: 1.85,
    commonEfficiency: 0.85,
    creatureEfficiency: 0.7,
    fragmentEfficiency: 0.55,
    growthResponse: 6.0,
    mergeDurationMin: 0.18,
    mergeDurationMax: 0.42
  },
  damage: {
    massFraction: 0.18,
    invulnerabilitySeconds: 0.75,
    recoverableMassMinFraction: 0.3,
    recoverableMassMaxFraction: 0.45
  },
  camera: {
    targetScreenFraction: 0.055,
    triggerScreenFraction: 0.078,
    deathScreenFraction: 0.016,
    springStiffness: 42,
    springDamping: 13,
    transitionMaxSeconds: 1.1,
    retriggerCooldownSeconds: 0.15
  },
  blob: {
    pointsLow: 16,
    pointsMedium: 20,
    pointsHigh: 24,
    spring: 58,
    damping: 10.5,
    neighborTension: 24,
    minOffset: -0.07,
    maxOffset: 0.09
  },
  world: {
    prewarmRadiusMultiplier: 1.25,
    cullRadiusMultiplier: 1.65,
    spawnInnerMultiplier: 0.9,
    spawnOuterMultiplier: 1.3,
    originRebaseThreshold: 1000000,
    maxParticlesLow: 320,
    maxParticlesHigh: 700
  },
  progression: {
    voluntaryEfficiency: 1.0,
    deathEfficiency: 0.65,
    difficultyMultiplier: {
      calm: 0.8,
      standard: 1.0,
      abyss: 1.35
    }
  },
  stages: [
    {
      id: "light-dust",
      index: 0,
      nameKo: "빛가루",
      nameEn: "Light Dust",
      background: "void-dust",
      audioStem: ["base"],
      threatBudget: 0.22
    }
  ],
  enemies: [
    {
      id: "drifter",
      minStage: 0,
      evaluationHz: 6,
      speedFraction: 0.45,
      states: ["wander", "flee", "pursue"]
    }
  ],
  traits: []
};

// Config validation helper
export function validateConfig(raw: unknown): { isValid: boolean; errors?: string } {
  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(balanceSchema);
  const valid = validate(raw);
  if (!valid) {
    return {
      isValid: false,
      errors: ajv.errorsText(validate.errors)
    };
  }
  return { isValid: true };
}

// Loads balance and assembly configuration safely.
// If any step fails or is invalid, fails closed to SAFE_DEFAULTS.
export function loadConfig(): GameConfig {
  try {
    // 1. Validate balance configuration structure
    const validationResult = validateConfig(balanceJson);
    if (!validationResult.isValid) {
      console.error(
        JSON.stringify({
          diagnostic: "CONFIG_VALIDATION_FAILURE",
          reason: "balance.config.json did not match the JSON Schema.",
          detail: validationResult.errors,
          timestamp: Date.now()
        })
      );
      return SAFE_DEFAULTS;
    }

    // 2. Safely parse stages config
    if (!stagesJson || !Array.isArray(stagesJson.stages)) {
      console.error(
        JSON.stringify({
          diagnostic: "CONFIG_VALIDATION_FAILURE",
          reason: "stages.config.json structure is invalid.",
          timestamp: Date.now()
        })
      );
      return SAFE_DEFAULTS;
    }

    // 3. Safely parse enemies config
    if (!enemiesJson || !Array.isArray(enemiesJson.archetypes)) {
      console.error(
        JSON.stringify({
          diagnostic: "CONFIG_VALIDATION_FAILURE",
          reason: "enemies.config.json structure is invalid.",
          timestamp: Date.now()
        })
      );
      return SAFE_DEFAULTS;
    }

    // Assemble the complete GameConfig
    const assembledConfig: GameConfig = {
      schemaVersion: balanceJson.schemaVersion,
      simulation: balanceJson.simulation as GameConfig["simulation"],
      movement: balanceJson.movement as GameConfig["movement"],
      relationship: balanceJson.relationship as GameConfig["relationship"],
      absorption: balanceJson.absorption as GameConfig["absorption"],
      damage: balanceJson.damage as GameConfig["damage"],
      camera: balanceJson.camera as GameConfig["camera"],
      blob: balanceJson.blob as GameConfig["blob"],
      world: balanceJson.world as GameConfig["world"],
      progression: balanceJson.progression as GameConfig["progression"],
      stages: stagesJson.stages as GameConfig["stages"],
      enemies: enemiesJson.archetypes as GameConfig["enemies"],
      traits: (Array.isArray(traitsJson) ? traitsJson : []) as GameConfig["traits"]
    };

    // Deep freeze
    deepFreeze(assembledConfig);
    return assembledConfig;
  } catch (error) {
    console.error(
      JSON.stringify({
        diagnostic: "CONFIG_LOAD_CRASH",
        reason: "Unexpected exception during configuration assembly.",
        detail: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      })
    );
    return SAFE_DEFAULTS;
  }
}

// Deep freeze utility
function deepFreeze<T extends object>(obj: T): T {
  const propNames = Reflect.ownKeys(obj);
  for (const name of propNames) {
    const value = (obj as Record<string | symbol, unknown>)[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}
