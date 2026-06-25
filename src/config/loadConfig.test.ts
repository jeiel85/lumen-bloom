import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadConfig, validateConfig, SAFE_DEFAULTS } from "./loadConfig";

describe("Configuration Loader & Validator", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.resetModules();
  });

  it("should validate a correct configuration structure", () => {
    const validRaw = {
      schemaVersion: 1,
      simulation: { fixedHz: 60, maxFrameDeltaSeconds: 0.1, maxStepsPerFrame: 5 },
      movement: { maxScreenSpeed: 200, accelerationResponseSeconds: 0.2, coastToTenPercentSeconds: 0.5, cameraLookAheadFraction: 0.05 },
      relationship: { edibleEnterRatio: 0.9, edibleExitRatio: 0.95, threatEnterRatio: 1.1, threatExitRatio: 1.05 },
      absorption: { magnetRadiusMultiplier: 1.5, commonEfficiency: 0.8, creatureEfficiency: 0.7, fragmentEfficiency: 0.5, growthResponse: 5, mergeDurationMin: 0.1, mergeDurationMax: 0.3 },
      damage: { massFraction: 0.2, invulnerabilitySeconds: 1.0, recoverableMassMinFraction: 0.2, recoverableMassMaxFraction: 0.4 },
      camera: { targetScreenFraction: 0.05, triggerScreenFraction: 0.08, deathScreenFraction: 0.02, springStiffness: 40, springDamping: 10, transitionMaxSeconds: 1.0, retriggerCooldownSeconds: 0.2 },
      blob: { pointsLow: 12, pointsMedium: 16, pointsHigh: 20, spring: 50, damping: 10, neighborTension: 20, minOffset: -0.05, maxOffset: 0.05 },
      world: { prewarmRadiusMultiplier: 1.2, cullRadiusMultiplier: 1.5, spawnInnerMultiplier: 0.8, spawnOuterMultiplier: 1.2, originRebaseThreshold: 10000, maxParticlesLow: 200, maxParticlesHigh: 500 },
      progression: { voluntaryEfficiency: 1.0, deathEfficiency: 0.5, difficultyMultiplier: { calm: 0.8, standard: 1.0, abyss: 1.5 } }
    };

    const result = validateConfig(validRaw);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("should fail validation and list errors for invalid configuration", () => {
    const invalidRaw = {
      schemaVersion: 2, // Must be 1
      simulation: {}
    };

    const result = validateConfig(invalidRaw);
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("should return SAFE_DEFAULTS when config load fails validation", async () => {
    // We temporarily mock balanceJson load by breaking the modules or by testing validateConfig fail logic.
    // To trigger loadConfig failure, we can mock balance.config.json or pass an invalid balance JSON via mocks.
    // In our loadConfig, it references '../../config/balance.config.json' directly.
    // Let's verify that loadConfig outputs diagnostic error when invalid.
    
    // We can mock the import of balance.config.json
    vi.mock("../../config/balance.config.json", () => ({
      default: {
        schemaVersion: 999, // Invalid
        simulation: {}
      }
    }));

    const config = loadConfig();
    expect(config).toEqual(SAFE_DEFAULTS);
    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedError = consoleErrorSpy.mock.calls[0][0];
    expect(loggedError).toContain("CONFIG_VALIDATION_FAILURE");
  });
});
