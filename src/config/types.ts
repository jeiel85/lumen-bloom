export interface SimulationConfig {
  fixedHz: number;
  maxFrameDeltaSeconds: number;
  maxStepsPerFrame: number;
}

export interface MovementConfig {
  maxScreenSpeed: number;
  accelerationResponseSeconds: number;
  coastToTenPercentSeconds: number;
  cameraLookAheadFraction: number;
}

export interface RelationshipConfig {
  edibleEnterRatio: number;
  edibleExitRatio: number;
  threatEnterRatio: number;
  threatExitRatio: number;
}

export interface AbsorptionConfig {
  magnetRadiusMultiplier: number;
  commonEfficiency: number;
  creatureEfficiency: number;
  fragmentEfficiency: number;
  growthResponse: number;
  mergeDurationMin: number;
  mergeDurationMax: number;
}

export interface DamageConfig {
  massFraction: number;
  invulnerabilitySeconds: number;
  recoverableMassMinFraction: number;
  recoverableMassMaxFraction: number;
}

export interface CameraConfig {
  targetScreenFraction: number;
  triggerScreenFraction: number;
  deathScreenFraction: number;
  springStiffness: number;
  springDamping: number;
  transitionMaxSeconds: number;
  retriggerCooldownSeconds: number;
}

export interface BlobConfig {
  pointsLow: number;
  pointsMedium: number;
  pointsHigh: number;
  spring: number;
  damping: number;
  neighborTension: number;
  minOffset: number;
  maxOffset: number;
}

export interface WorldConfig {
  prewarmRadiusMultiplier: number;
  cullRadiusMultiplier: number;
  spawnInnerMultiplier: number;
  spawnOuterMultiplier: number;
  originRebaseThreshold: number;
  maxParticlesLow: number;
  maxParticlesHigh: number;
}

export interface ProgressionConfig {
  voluntaryEfficiency: number;
  deathEfficiency: number;
  difficultyMultiplier: {
    calm: number;
    standard: number;
    abyss: number;
  };
}

export interface StageConfig {
  id: string;
  index: number;
  nameKo: string;
  nameEn: string;
  background: string;
  audioStem: string[];
  threatBudget: number;
}

export interface EnemyArchetypeConfig {
  id: string;
  minStage: number;
  evaluationHz: number;
  speedFraction: number;
  states: string[];
}

export interface TraitDefinition {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  cost: number;
}

export interface GameConfig {
  schemaVersion: number;
  simulation: SimulationConfig;
  movement: MovementConfig;
  relationship: RelationshipConfig;
  absorption: AbsorptionConfig;
  damage: DamageConfig;
  camera: CameraConfig;
  blob: BlobConfig;
  world: WorldConfig;
  progression: ProgressionConfig;
  stages: readonly StageConfig[];
  enemies: readonly EnemyArchetypeConfig[];
  traits: readonly TraitDefinition[];
}
