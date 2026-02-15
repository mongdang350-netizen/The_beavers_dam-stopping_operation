export type EffectType = 'poison' | 'slow' | 'stun' | 'burn' | 'asDeBuff';

export interface Effect {
  type: EffectType;
  duration: number;
  value: number;
  ignoresArmor: boolean;
}
