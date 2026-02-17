import { z } from 'zod';

const towerFamilySchema = z.enum(['agile', 'brave', 'capable', 'smart']);
const attackTypeSchema = z.enum(['physical', 'magic', 'summon', 'production', 'aoe']);
const targetModeSchema = z.enum(['single', 'aoe', 'none']);
const effectTypeSchema = z.enum(['poison', 'slow', 'stun', 'burn', 'asDeBuff']);
const towerIdSchema = z.enum([
  'agile',
  'brave',
  'barbarian',
  'capable',
  'smart',
  'archer',
  'blowgunner',
  'knight',
  'dragonTamer',
  'wizard',
  'logRoller',
  'waterBomber',
]);
const enemyTypeSchema = z.enum([
  'piranha',
  'catfish',
  'iguana',
  'waterSnake',
  'turtle',
  'anaconda',
  'crocodile',
  'hippo',
  'elephant',
]);

const stunAuraSchema = z.object({
  cooldown: z.number().positive(),
  duration: z.number().positive(),
  radius: z.number().positive(),
});

const towerSpecialSchema = z
  .object({
    effectType: effectTypeSchema.optional(),
    effectDuration: z.number().positive().optional(),
    effectValue: z.number().optional(),
    summonSoldiers: z.boolean().optional(),
    goldPerInterval: z.number().positive().optional(),
    goldInterval: z.number().positive().optional(),
    stunAura: stunAuraSchema.optional(),
  })
  .strict();

export const towerConfigSchema = z
  .object({
    id: towerIdSchema,
    family: towerFamilySchema,
    role: z.enum(['base', 'upgrade']),
    tier: z.union([z.literal(1), z.literal(2)]),
    baseTowerId: towerFamilySchema.optional(),
    name: z.string().min(1),
    cost: z.number().int().nonnegative(),
    attackType: attackTypeSchema,
    atk: z.number().nonnegative(),
    attackSpeed: z.number().positive(),
    range: z.number().nonnegative(),
    targetMode: targetModeSchema,
    maxTargets: z.number().int().positive().optional(),
    aoeRadius: z.number().positive().optional(),
    special: towerSpecialSchema.optional(),
  })
  .strict();

export const enemyConfigSchema = z
  .object({
    id: enemyTypeSchema,
    name: z.string().min(1),
    hp: z.number().positive(),
    speed: z.number().nonnegative(),
    attackType: z.enum(['physical', 'magic']),
    atk: z.number().nonnegative(),
    attackSpeed: z.number().positive(),
    def: z.number().nonnegative(),
    mdef: z.number().nonnegative(),
    gold: z.number().int().nonnegative(),
    isBoss: z.boolean(),
    sizeMultiplier: z.number().positive(),
    spawnInterval: z.number().positive(),
    category: z.enum(['weak', 'mid', 'strong', 'boss']),
    special: z
      .object({
        towerAttackSpeedDebuff: z
          .object({
            radius: z.number().positive(),
            value: z.number().positive(),
          })
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

const spawnEntrySchema = z
  .object({
    type: enemyTypeSchema,
    count: z.number().int().positive(),
  })
  .strict();

const waveConfigSchema = z
  .object({
    enemies: z.array(spawnEntrySchema),
  })
  .strict();

export const stageConfigSchema = z
  .object({
    id: z.number().int().positive(),
    waves: z.tuple([waveConfigSchema, waveConfigSchema, waveConfigSchema]),
    bonusGold: z.number().int().nonnegative().optional(),
  })
  .strict();

const pointSchema = z
  .object({
    x: z.number().nonnegative(),
    y: z.number().nonnegative(),
  })
  .strict();

const towerSlotSchema = pointSchema
  .extend({
    id: z.number().int().nonnegative(),
  })
  .strict();

export const mapsSchema = z
  .object({
    defaultMap: z
      .object({
        waypoints: z.array(pointSchema).min(2),
        towerSlots: z.array(towerSlotSchema).length(6),
        damPosition: pointSchema,
      })
      .strict(),
  })
  .strict();

export const textsSchema = z
  .object({
    ko: z.record(z.string(), z.string()),
  })
  .strict();

export const towersSchema = z.array(towerConfigSchema).length(12);
export const enemiesSchema = z.array(enemyConfigSchema).length(9);
export const stagesSchema = z.array(stageConfigSchema).length(10);

export type TowerConfigData = z.infer<typeof towerConfigSchema>;
export type EnemyConfigData = z.infer<typeof enemyConfigSchema>;
export type StageConfigData = z.infer<typeof stageConfigSchema>;
