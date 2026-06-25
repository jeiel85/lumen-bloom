import type { RandomSource } from "../state/types";

export class MulberryRandom implements RandomSource {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  public next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public int(minInclusive: number, maxExclusive: number): number {
    return Math.floor(this.range(minInclusive, maxExclusive));
  }

  // Fork a new RandomSource utilizing a hashed label
  public fork(label: string): RandomSource {
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = (hash << 5) - hash + label.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    // Mix current state and label hash to derive child seed
    const newSeed = (Math.floor(this.next() * 0xfffffff) ^ hash) >>> 0;
    return new MulberryRandom(newSeed);
  }
}
