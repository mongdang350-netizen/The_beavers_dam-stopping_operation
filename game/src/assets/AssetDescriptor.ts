export type EntityType = 'tower' | 'enemy' | 'soldier' | 'tile' | 'dam' | 'effect' | 'ui';
export type TowerFamily = 'agile' | 'brave' | 'capable' | 'smart';
export type AnimationState =
  | 'idle' | 'attack' | 'walk' | 'cast' | 'shout'
  | 'farm' | 'drink' | 'lever' | 'fire' | 'flag'
  | 'breathe' | 'throw' | 'slither';

export interface AssetDescriptor {
  /** Entity category */
  entity: EntityType;
  /** Tower family (only for tower/soldier entities) */
  family?: TowerFamily;
  /** Unique identifier within entity type (e.g., 'archer', 'piranha') */
  id: string;
  /** Animation state */
  state: AnimationState;
  /** Frame index (0-based) */
  frame: number;
  /** Pixel dimensions of this asset */
  size: { width: number; height: number };
  /** Optional depth hint for rendering order */
  depthHint?: number;
}

/** Generate a unique texture key from an asset descriptor */
export function getTextureKey(descriptor: Pick<AssetDescriptor, 'entity' | 'id' | 'state'>): string {
  return `${descriptor.entity}_${descriptor.id}_${descriptor.state}`;
}

/** Generate a spritesheet key (without frame) */
export function getSpriteSheetKey(entity: EntityType, id: string, state: AnimationState): string {
  return `${entity}_${id}_${state}_sheet`;
}

/** Generate animation key */
export function getAnimationKey(entity: EntityType, id: string, state: AnimationState): string {
  return `anim_${entity}_${id}_${state}`;
}
