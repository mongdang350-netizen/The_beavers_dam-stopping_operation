export interface DamageResult {
  targetId: string;
  damage: number;
  isDead: boolean;
  goldEarned?: number;
}

export interface Position {
  x: number;
  y: number;
}
