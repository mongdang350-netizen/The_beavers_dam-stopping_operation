import { distance, lerpPosition } from '@/utils/math';
import { RANGE_UNIT, SPEED_UNIT } from '@/utils/constants';
import type { MapConfig, Position, TowerSlot } from '@/types';

interface Segment {
  from: Position;
  to: Position;
  length: number;
  cumulativeLength: number;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export class PathSystem {
  private readonly waypoints: Position[];
  private readonly towerSlots: TowerSlot[];
  private readonly damPosition: Position;
  private readonly segments: Segment[];
  private readonly totalPathLength: number;

  constructor(mapData: MapConfig) {
    this.waypoints = mapData.waypoints.map((point) => ({ ...point }));
    this.towerSlots = mapData.towerSlots.map((slot) => ({ ...slot }));
    this.damPosition = { ...mapData.damPosition };

    let cumulativeLength = 0;
    this.segments = [];
    for (let i = 0; i < this.waypoints.length - 1; i += 1) {
      const from = this.waypoints[i];
      const to = this.waypoints[i + 1];
      const length = distance(from, to);
      cumulativeLength += length;
      this.segments.push({
        from,
        to,
        length,
        cumulativeLength,
      });
    }
    this.totalPathLength = cumulativeLength;
  }

  getPositionAtProgress(t: number): Position {
    if (this.segments.length === 0 || this.totalPathLength === 0) {
      return { ...this.waypoints[0] };
    }

    const clamped = clamp01(t);
    if (clamped <= 0) {
      return { ...this.waypoints[0] };
    }
    if (clamped >= 1) {
      return { ...this.waypoints[this.waypoints.length - 1] };
    }

    const targetLength = clamped * this.totalPathLength;
    let previousCumulative = 0;

    for (const segment of this.segments) {
      if (targetLength <= segment.cumulativeLength) {
        const segmentDistance = targetLength - previousCumulative;
        const localT = segment.length === 0 ? 0 : segmentDistance / segment.length;
        return lerpPosition(segment.from, segment.to, localT);
      }
      previousCumulative = segment.cumulativeLength;
    }

    return { ...this.waypoints[this.waypoints.length - 1] };
  }

  getProgressAtPosition(pos: Position): number {
    if (this.segments.length === 0 || this.totalPathLength === 0) {
      return 0;
    }

    let minDistance = Number.POSITIVE_INFINITY;
    let bestLength = 0;
    let previousCumulative = 0;

    for (const segment of this.segments) {
      const segVector = { x: segment.to.x - segment.from.x, y: segment.to.y - segment.from.y };
      const segLengthSquared = segVector.x * segVector.x + segVector.y * segVector.y;
      if (segLengthSquared === 0) {
        continue;
      }

      const toPos = { x: pos.x - segment.from.x, y: pos.y - segment.from.y };
      const projection = (toPos.x * segVector.x + toPos.y * segVector.y) / segLengthSquared;
      const localT = Math.max(0, Math.min(1, projection));
      const projectedPoint = lerpPosition(segment.from, segment.to, localT);
      const projectedDistance = distance(pos, projectedPoint);

      if (projectedDistance < minDistance) {
        minDistance = projectedDistance;
        bestLength = previousCumulative + segment.length * localT;
      }

      previousCumulative = segment.cumulativeLength;
    }

    return bestLength / this.totalPathLength;
  }

  getTotalPathLength(): number {
    return this.totalPathLength;
  }

  getSpeedAsProgress(speed: number): number {
    if (this.totalPathLength <= 0) {
      return 0;
    }
    return (speed * SPEED_UNIT) / this.totalPathLength;
  }

  getTowerSlots(): TowerSlot[] {
    return this.towerSlots.map((slot) => ({ ...slot }));
  }

  getDamPosition(): Position {
    return { ...this.damPosition };
  }

  isInRange(from: Position, to: Position, range: number): boolean {
    return distance(from, to) <= range * RANGE_UNIT;
  }
}

