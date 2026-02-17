import { mapsData } from '@/data/validatedData';
import { defaultGridMap } from '@/data/gridMaps';
import type { GridMapData } from '@/data/gridMaps';
import { toScreen } from '@/core/IsometricUtils';
import { buildGameSceneLayout, buildLayoutFromGrid, gridMapToMapConfig } from '@/scenes/layout';
import { GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';

describe('buildGameSceneLayout', () => {
  it('builds default map layout with river, slots and dam', () => {
    const layout = buildGameSceneLayout(mapsData.defaultMap);

    expect(layout.riverPath.length).toBeGreaterThanOrEqual(2);
    expect(layout.slots).toHaveLength(6);
    expect(layout.damPosition).toEqual(mapsData.defaultMap.damPosition);
    expect(layout.bounds.width).toBe(1280);
    expect(layout.bounds.height).toBe(720);
  });
});

describe('buildLayoutFromGrid', () => {
  it('converts grid waypoints to screen coordinates', () => {
    const layout = buildLayoutFromGrid(defaultGridMap);

    expect(layout.riverPath).toHaveLength(defaultGridMap.waypoints.length);

    for (let i = 0; i < defaultGridMap.waypoints.length; i++) {
      const wp = defaultGridMap.waypoints[i];
      const expected = toScreen(wp.gridX, wp.gridY);
      expect(layout.riverPath[i]).toEqual({ x: expected.screenX, y: expected.screenY });
    }
  });

  it('converts grid tower slots to screen coordinates with ids', () => {
    const layout = buildLayoutFromGrid(defaultGridMap);

    expect(layout.slots).toHaveLength(6);

    for (let i = 0; i < defaultGridMap.towerSlots.length; i++) {
      const slot = defaultGridMap.towerSlots[i];
      const expected = toScreen(slot.gridX, slot.gridY);
      expect(layout.slots[i]).toEqual({
        id: slot.id,
        x: expected.screenX,
        y: expected.screenY,
      });
    }
  });

  it('converts dam position to screen coordinates', () => {
    const dam = defaultGridMap.damPosition;
    const expected = toScreen(dam.gridX, dam.gridY);
    const layout = buildLayoutFromGrid(defaultGridMap);

    expect(layout.damPosition).toEqual({ x: expected.screenX, y: expected.screenY });
  });

  it('sets bounds to game dimensions', () => {
    const layout = buildLayoutFromGrid(defaultGridMap);

    expect(layout.bounds).toEqual({ width: GAME_WIDTH, height: GAME_HEIGHT });
  });

  it('produces at least 2 waypoints for valid path', () => {
    const layout = buildLayoutFromGrid(defaultGridMap);

    expect(layout.riverPath.length).toBeGreaterThanOrEqual(2);
  });

  it('handles minimal grid map', () => {
    const minimal: GridMapData = {
      waypoints: [
        { gridX: 0, gridY: 0 },
        { gridX: 9, gridY: 9 },
      ],
      towerSlots: [{ id: 0, gridX: 5, gridY: 5 }],
      damPosition: { gridX: 9, gridY: 9 },
    };

    const layout = buildLayoutFromGrid(minimal);

    expect(layout.riverPath).toHaveLength(2);
    expect(layout.slots).toHaveLength(1);
    expect(layout.slots[0].id).toBe(0);
  });
});

describe('gridMapToMapConfig', () => {
  it('produces MapConfig compatible with PathSystem', () => {
    const config = gridMapToMapConfig(defaultGridMap);

    expect(config.waypoints).toHaveLength(defaultGridMap.waypoints.length);
    expect(config.towerSlots).toHaveLength(6);
    expect(config.damPosition).toBeDefined();

    // Each waypoint should have x and y (screen coords)
    for (const wp of config.waypoints) {
      expect(typeof wp.x).toBe('number');
      expect(typeof wp.y).toBe('number');
    }

    // Each tower slot should have id, x, y
    for (const slot of config.towerSlots) {
      expect(typeof slot.id).toBe('number');
      expect(typeof slot.x).toBe('number');
      expect(typeof slot.y).toBe('number');
    }
  });

  it('produces identical screen coordinates as buildLayoutFromGrid', () => {
    const layout = buildLayoutFromGrid(defaultGridMap);
    const config = gridMapToMapConfig(defaultGridMap);

    expect(config.waypoints).toEqual(layout.riverPath);
    expect(config.towerSlots).toEqual(layout.slots);
    expect(config.damPosition).toEqual(layout.damPosition);
  });

  it('returns correct screen coordinates for known grid positions', () => {
    const config = gridMapToMapConfig(defaultGridMap);

    // First waypoint is at grid (5, 0)
    const expectedFirst = toScreen(5, 0);
    expect(config.waypoints[0]).toEqual({
      x: expectedFirst.screenX,
      y: expectedFirst.screenY,
    });

    // Last waypoint is at grid (5, 9)
    const expectedLast = toScreen(5, 9);
    expect(config.waypoints[config.waypoints.length - 1]).toEqual({
      x: expectedLast.screenX,
      y: expectedLast.screenY,
    });
  });
});

describe('defaultGridMap', () => {
  it('has tower slots on distinct grid cells', () => {
    const positions = defaultGridMap.towerSlots.map((s) => `${s.gridX},${s.gridY}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(positions.length);
  });

  it('has tower slots that are not on any waypoint', () => {
    const waypointSet = new Set(
      defaultGridMap.waypoints.map((wp) => `${wp.gridX},${wp.gridY}`),
    );
    for (const slot of defaultGridMap.towerSlots) {
      expect(waypointSet.has(`${slot.gridX},${slot.gridY}`)).toBe(false);
    }
  });

  it('has dam position matching the last waypoint', () => {
    const lastWp = defaultGridMap.waypoints[defaultGridMap.waypoints.length - 1];
    expect(defaultGridMap.damPosition).toEqual(lastWp);
  });

  it('has sequential tower slot ids starting from 0', () => {
    const ids = defaultGridMap.towerSlots.map((s) => s.id);
    expect(ids).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('all grid positions are within 10x10 bounds', () => {
    const allPositions = [
      ...defaultGridMap.waypoints,
      ...defaultGridMap.towerSlots,
      defaultGridMap.damPosition,
    ];
    for (const pos of allPositions) {
      expect(pos.gridX).toBeGreaterThanOrEqual(0);
      expect(pos.gridX).toBeLessThan(10);
      expect(pos.gridY).toBeGreaterThanOrEqual(0);
      expect(pos.gridY).toBeLessThan(10);
    }
  });
});
