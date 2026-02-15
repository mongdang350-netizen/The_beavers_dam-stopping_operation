import rawEnemies from '@/data/enemies.json';
import rawMaps from '@/data/maps.json';
import rawStages from '@/data/stages.json';
import rawTexts from '@/data/texts.json';
import rawTowers from '@/data/towers.json';
import { enemiesSchema, mapsSchema, stagesSchema, textsSchema, towersSchema } from '@/data/schema';

export const towersData = towersSchema.parse(rawTowers);
export const enemiesData = enemiesSchema.parse(rawEnemies);
export const stagesData = stagesSchema.parse(rawStages);
export const mapsData = mapsSchema.parse(rawMaps);
export const textsData = textsSchema.parse(rawTexts);
