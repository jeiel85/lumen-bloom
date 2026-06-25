import { Vec2 } from "../math/Vec2";

export interface Mote {
  id: number;
  position: Vec2;
  velocity: Vec2;
  mass: number;
  state: "idle" | "magnetized" | "merging" | "consumed";
  mergeElapsed: number;
  mergeDuration: number;
  targetAngle: number;
}

export class MotePool {
  private pool: Mote[] = [];
  private nextId = 1;

  constructor(initialCapacity = 200) {
    for (let i = 0; i < initialCapacity; i++) {
      this.pool.push(this.createDeadMote());
    }
  }

  private createDeadMote(): Mote {
    return {
      id: 0,
      position: Vec2.create(0, 0),
      velocity: Vec2.create(0, 0),
      mass: 0,
      state: "consumed", // dead state
      mergeElapsed: 0,
      mergeDuration: 0,
      targetAngle: 0
    };
  }

  public spawn(x: number, y: number, mass: number): Mote {
    let mote = this.pool.find(m => m.state === "consumed");
    if (!mote) {
      mote = this.createDeadMote();
      this.pool.push(mote);
    }
    mote.id = this.nextId++;
    mote.position.x = x;
    mote.position.y = y;
    mote.velocity.x = 0;
    mote.velocity.y = 0;
    mote.mass = mass;
    mote.state = "idle";
    mote.mergeElapsed = 0;
    mote.mergeDuration = 0;
    mote.targetAngle = 0;
    return mote;
  }

  public free(mote: Mote): void {
    mote.state = "consumed";
    mote.id = 0;
  }

  public getActiveMotes(): Mote[] {
    return this.pool.filter(m => m.state !== "consumed");
  }

  public clear(): void {
    for (const mote of this.pool) {
      mote.state = "consumed";
      mote.id = 0;
    }
    this.nextId = 1;
  }
}
