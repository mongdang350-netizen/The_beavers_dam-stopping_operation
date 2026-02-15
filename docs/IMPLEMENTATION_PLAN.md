# 비버들의 댐막기 대작전 - 코드 구현 계획 v2

> 이 문서는 AI Agent(Claude Code)가 TDD 방식으로 단계별 구현할 수 있는 상세 실행 계획입니다.
> 기획 원본: `../GDD.md` 참조
> v2: 비평 피드백 전면 반영 (Phase 재배치, 누락 항목 보완, 특수 메커니즘 상세화)

---

## 기술 스택 상세

| 항목 | 도구 | 버전 |
|---|---|---|
| 런타임 | Node.js | 20+ LTS |
| 패키지 매니저 | npm | 10+ |
| 빌드 도구 | Vite | 6+ |
| 언어 | TypeScript | 5.7+ (strict mode) |
| 게임 엔진 | Phaser 3 | 3.80+ |
| 테스트 | Vitest | 3+ |
| 린터 | ESLint | 9+ (flat config) |
| 포매터 | Prettier | 3+ |
| Git Hooks | husky + lint-staged | 최신 |
| CI | GitHub Actions | - |
| 지원 브라우저 | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ | - |

### 핵심 아키텍처 결정 사항

| 결정 | 선택 | 이유 |
|---|---|---|
| GameState 패턴 | **DI (의존성 주입)** | 테스트 시 mock 주입 가능, 싱글톤보다 테스트 친화적 |
| 엔티티-스프라이트 매핑 | **Wrapper 패턴** | `EnemySprite extends Phaser.GameObjects.Sprite`가 내부에 `Enemy` 로직 객체 보유 |
| 물리 엔진 | **순수 수학 계산** | 로직/렌더링 분리 원칙 유지. Phaser Arcade Physics 사용하지 않음 |
| Scene 간 데이터 전달 | **GameState 통한 공유** | `scene.start('GameOver')` 호출 시 GameState에서 결과 데이터 조회 |
| 충돌 감지 | **수학 거리 계산** | 타워 6개뿐이므로 O(6*n) 충분. 200+ 적도 선형 탐색으로 감당 가능 |
| 오브젝트 관리 | **오브젝트 풀링** | Enemy, Projectile, Effect에 풀링 적용. Phaser Group 활용 |

### 단위 환산 기준

| 항목 | 값 | 설명 |
|---|---|---|
| 게임 해상도 | 1280 × 720 px | 16:9 비율 |
| 타일 크기 | 64 × 64 px | 1 타일 = 64px |
| 사거리 1.0 | 64 px | 사거리 단위 = 타일 단위 |
| 속도 1.0 | 64 px/초 | SPD 5 = 320px/초 |

---

## 프로젝트 구조

```
beaver/
├── docs/                              # 문서
│   └── IMPLEMENTATION_PLAN.md
├── GDD.md                             # 게임 디자인 문서
├── plan.md                            # 원본 기획서
├── game/                              # 게임 소스코드 루트
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── .github/
│   │   └── workflows/
│   │       └── ci.yml                 # GitHub Actions CI
│   ├── index.html                     # 엔트리 HTML
│   ├── public/
│   │   └── assets/
│   │       ├── sprites/               # 스프라이트 에셋
│   │       ├── audio/                 # 사운드 에셋
│   │       └── fonts/                 # 한국어 웹폰트
│   ├── src/
│   │   ├── main.ts                    # Phaser Game 초기화
│   │   ├── config.ts                  # Phaser 게임 설정
│   │   ├── types/                     # 공통 타입/인터페이스
│   │   │   ├── index.ts              # 모든 타입 re-export
│   │   │   ├── tower.types.ts
│   │   │   ├── enemy.types.ts
│   │   │   ├── combat.types.ts
│   │   │   ├── stage.types.ts
│   │   │   └── effect.types.ts       # 상태이상 효과 타입
│   │   ├── data/                      # JSON 게임 데이터
│   │   │   ├── towers.json
│   │   │   ├── enemies.json
│   │   │   ├── stages.json
│   │   │   ├── maps.json
│   │   │   └── texts.json            # UI 텍스트 (i18n 구조)
│   │   ├── core/                      # 핵심 시스템 (Phaser 비의존)
│   │   │   ├── GameState.ts           # 전역 게임 상태 (DI 패턴)
│   │   │   ├── EventBus.ts            # 이벤트 시스템
│   │   │   ├── DamageCalculator.ts    # 데미지 계산 로직
│   │   │   ├── GoldManager.ts         # 골드 경제 관리
│   │   │   ├── ScoreCalculator.ts     # 별 평가 점수 계산
│   │   │   └── GameLoopManager.ts     # 시스템 조율 매니저
│   │   ├── entities/                  # 게임 엔티티
│   │   │   ├── Tower.ts               # 타워 기본 클래스
│   │   │   ├── TowerFactory.ts        # 타워 생성 팩토리
│   │   │   ├── Enemy.ts               # 적 기본 클래스
│   │   │   ├── EnemyFactory.ts        # 적 생성 팩토리
│   │   │   ├── Projectile.ts          # 투사체
│   │   │   ├── Soldier.ts             # 전사비버 병사
│   │   │   └── Dam.ts                 # 댐
│   │   ├── systems/                   # 게임 시스템
│   │   │   ├── PathSystem.ts          # 경로/웨이포인트 관리
│   │   │   ├── SpawnSystem.ts         # 적 스폰 관리
│   │   │   ├── CombatSystem.ts        # 전투 로직 (타겟팅, 공격)
│   │   │   ├── EffectSystem.ts        # 상태이상 관리 (독, 둔화, 기절)
│   │   │   ├── WaveSystem.ts          # Wave 진행 관리
│   │   │   ├── StageSystem.ts         # 스테이지 진행 관리
│   │   │   ├── TowerPlacementSystem.ts # 타워 배치 관리
│   │   │   └── UpgradeSystem.ts       # 타워 업그레이드 관리
│   │   ├── scenes/                    # Phaser Scenes
│   │   │   ├── BootScene.ts           # 에셋 로딩 + 한국어 폰트
│   │   │   ├── MenuScene.ts           # 시작 화면
│   │   │   ├── GameScene.ts           # 메인 게임 화면
│   │   │   ├── GameOverScene.ts       # 게임 오버 화면
│   │   │   └── VictoryScene.ts        # 클리어 화면
│   │   ├── renderers/                 # Phaser 렌더링 래퍼
│   │   │   ├── EnemyRenderer.ts       # 적 스프라이트 관리
│   │   │   ├── TowerRenderer.ts       # 타워 스프라이트 관리
│   │   │   ├── ProjectileRenderer.ts  # 투사체 렌더링
│   │   │   ├── SoldierRenderer.ts     # 전사 병사 렌더링
│   │   │   └── EffectRenderer.ts      # 이펙트 렌더링
│   │   ├── ui/                        # UI 컴포넌트
│   │   │   ├── HUD.ts                 # 게임 HUD
│   │   │   ├── TowerPalette.ts        # 타워 선택 팔레트
│   │   │   ├── UpgradePalette.ts      # 업그레이드 팔레트
│   │   │   ├── RallyPointDragger.ts   # 집결지점 드래그 UI
│   │   │   ├── WaveStartButton.ts     # Wave 시작 버튼
│   │   │   ├── SpeedControl.ts        # 배속 조절
│   │   │   └── DamHealthBar.ts        # 댐 체력바
│   │   ├── debug/                     # 개발용 디버그 도구
│   │   │   └── DebugPanel.ts          # 골드 치트, 스테이지 스킵, 적 스폰 제어
│   │   └── utils/                     # 유틸리티
│   │       ├── math.ts                # 거리 계산, 보간, 벡터
│   │       ├── constants.ts           # 게임 상수 (TILE_SIZE, 해상도 등)
│   │       └── ObjectPool.ts          # 오브젝트 풀링
│   └── tests/                         # 테스트 파일 (src 미러 구조)
│       ├── core/
│       │   ├── EventBus.test.ts
│       │   ├── GameState.test.ts
│       │   ├── DamageCalculator.test.ts
│       │   ├── GoldManager.test.ts
│       │   └── ScoreCalculator.test.ts
│       ├── entities/
│       │   ├── Tower.test.ts
│       │   ├── Enemy.test.ts
│       │   ├── Projectile.test.ts
│       │   ├── Soldier.test.ts
│       │   └── Dam.test.ts
│       ├── systems/
│       │   ├── PathSystem.test.ts
│       │   ├── SpawnSystem.test.ts
│       │   ├── CombatSystem.test.ts
│       │   ├── EffectSystem.test.ts
│       │   ├── WaveSystem.test.ts
│       │   ├── StageSystem.test.ts
│       │   ├── TowerPlacementSystem.test.ts
│       │   └── UpgradeSystem.test.ts
│       ├── utils/
│       │   └── ObjectPool.test.ts
│       └── integration/
│           ├── game-flow.test.ts
│           ├── economy.test.ts
│           └── combat-scenarios.test.ts
```

---

## 구현 페이즈 (총 14 페이즈: Phase 0~13)

> 모든 페이즈는 **TDD**: 테스트 작성 → 구현 → 리팩토링 순서를 따름.
> Phase 순서는 비평 피드백 반영하여 재배치됨.

---

### Phase 0: 프로젝트 셋업 + CI

**목표**: 개발 환경 구축, CI 파이프라인, 빈 Phaser 게임이 브라우저에서 실행되는 상태

**작업 목록**:
1. `game/` 디렉토리 생성
2. `npm init` → `package.json` 생성
3. 의존성 설치:
   - **런타임**: `phaser`
   - **개발**: `typescript`, `vite`, `vitest`, `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`, `husky`, `lint-staged`
4. `tsconfig.json` 설정 (strict mode, paths alias: `@/*` → `src/*`)
5. `vite.config.ts` 설정
   - **주의**: Vite HMR + Phaser 함께 사용 시 Scene 중복 생성 문제 → `vite.config.ts`에서 Phaser의 `game.destroy(true)` 후 재생성하는 HMR 핸들러 설정 필요
6. `vitest.config.ts` 설정 (Phaser mock 설정 포함)
7. `eslint.config.js` flat config 설정
8. `.prettierrc` 설정
9. `index.html` + `src/main.ts` → 빈 Phaser Game 인스턴스 생성
10. `src/config.ts` → Phaser 게임 설정:
    ```typescript
    {
      type: Phaser.AUTO,       // WebGL 우선, Canvas 폴백
      width: 1280,
      height: 720,
      scale: {
        mode: Phaser.Scale.FIT, // 화면에 맞춰 자동 스케일
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      input: { touch: true }   // 모바일 터치 지원
    }
    ```
11. `src/utils/constants.ts` → 핵심 상수 정의:
    ```typescript
    export const TILE_SIZE = 64;          // 1타일 = 64px
    export const GAME_WIDTH = 1280;
    export const GAME_HEIGHT = 720;
    export const SPEED_UNIT = 64;         // SPD 1.0 = 64px/초
    export const RANGE_UNIT = 64;         // Range 1.0 = 64px
    ```
12. 빈 `BootScene` → 검은 화면에 "Loading..." 텍스트
13. GitHub Actions CI 설정 (`.github/workflows/ci.yml`):
    - push/PR 시 자동 실행
    - `npm ci` → `npm run lint` → `npm run test` → `npm run build`
14. `npm scripts` 확인:
    - `dev`: Vite 개발 서버
    - `build`: 프로덕션 빌드
    - `test`: Vitest 실행
    - `test:coverage`: 커버리지 포함
    - `lint`: ESLint
    - `format`: Prettier

**완료 기준**:
- `npm run dev` → 브라우저에서 1280×720 검은 Phaser 화면 표시
- `npm run test` → Vitest 실행 (0 tests, pass)
- `npm run lint` → ESLint 에러 없음
- `npm run build` → 빌드 성공
- CI 파이프라인 동작 확인

---

### Phase 1: 타입 정의 & 데이터 레이어

**목표**: 모든 게임 데이터 타입과 JSON 데이터 파일 완성

**작업 목록**:
1. `src/types/tower.types.ts`:
   ```typescript
   type AttackType = 'physical' | 'magical';
   type TargetMode = 'single' | 'aoe' | 'cone' | 'line'; // cone: 화염마법사, line: 통나무
   type TowerType = 'archer' | 'warrior' | 'mage' | 'bomb';
   type UpgradeType = 'blowgunner' | 'crossbowman' | 'knight' | 'suit' | 'fireMage' | 'iceMage' | 'logRoller' | 'mortar';

   interface TowerConfig {
     id: TowerType | UpgradeType;
     name: string;           // 한국어 표시명
     cost: number;
     attackType: AttackType;
     atk: number;
     attackSpeed: number;    // 초당 공격 횟수
     range: number;          // 타일 단위
     targetMode: TargetMode;
     maxTargets?: number;    // aoe 최대 타격 수
     aoeRadius?: number;     // aoe 반경 (타일 단위)
     coneAngle?: number;     // cone 각도 (도)
     special?: TowerSpecial;
   }

   interface SoldierConfig {
     count: number;          // 병사 수
     hp: number;
     atk: number;
     attackSpeed: number;
     def: number;
     mdef: number;
     respawnTime: number;    // 초
   }

   interface TowerUpgradeConfig extends TowerConfig {
     baseTowerId: TowerType;
     soldierConfig?: SoldierConfig; // 전사 계열만
   }
   ```

2. `src/types/enemy.types.ts`:
   ```typescript
   type EnemyType = 'piranha' | 'catfish' | 'iguana' | 'waterSnake' | 'turtle' | 'anaconda' | 'crocodile' | 'hippo' | 'elephant';
   type EnemyStatus = 'moving' | 'blocked' | 'attackingDam' | 'dead';

   interface EnemyConfig {
     id: EnemyType;
     name: string;
     hp: number;
     speed: number;
     attackType: AttackType;
     atk: number;
     attackSpeed: number;
     def: number;
     mdef: number;
     gold: number;
     isBoss: boolean;
     sizeMultiplier: number;  // 1 = 기본, 2 = 아나콘다, 4 = 코끼리
     special?: EnemySpecial;
   }
   ```

3. `src/types/effect.types.ts`:
   ```typescript
   type EffectType = 'poison' | 'slow' | 'stun' | 'burn' | 'asDeBuff';

   interface Effect {
     type: EffectType;
     duration: number;       // 남은 시간 (초)
     value: number;          // 독: DPS, 둔화: 비율(0.3=30%), 기절: 없음, AS디버프: 감소량
     ignoresArmor: boolean;  // 방어력 무시 여부
   }
   ```

4. `src/types/stage.types.ts`:
   ```typescript
   interface SpawnEntry { type: EnemyType; count: number; }
   interface WaveConfig { enemies: SpawnEntry[]; }
   interface StageConfig {
     id: number;
     waves: [WaveConfig, WaveConfig, WaveConfig]; // 정확히 3 Wave
     bonusGold?: number;
   }
   ```

5. `src/types/combat.types.ts`:
   ```typescript
   interface DamageResult { targetId: string; damage: number; isDead: boolean; goldEarned?: number; }
   interface Position { x: number; y: number; }
   ```

6. `src/types/index.ts` → 모든 타입 re-export

7. **JSON 데이터 파일** (GDD 스펙 기반):
   - `src/data/towers.json` - 4종 기본 + 8종 업그레이드 (사거리, 광역범위, 특수효과 모두 포함)
   - `src/data/enemies.json` - 9종 (AS, DEF, MDEF 빠짐없이)
   - `src/data/stages.json` - 10스테이지 × 3 Wave 전체 데이터
   - `src/data/maps.json` - 맵 데이터 (아래 참조)
   - `src/data/texts.json` - UI 텍스트 (i18n 구조: `{ "ko": { "start": "시작", ... } }`)

8. **맵 좌표 정의** (`maps.json`):
   ```json
   {
     "defaultMap": {
       "waypoints": [
         { "x": 640, "y": 0 },
         { "x": 900, "y": 120 },
         { "x": 380, "y": 240 },
         { "x": 900, "y": 360 },
         { "x": 380, "y": 480 },
         { "x": 640, "y": 600 },
         { "x": 640, "y": 720 }
       ],
       "towerSlots": [
         { "x": 760, "y": 60, "id": 0 },
         { "x": 520, "y": 180, "id": 1 },
         { "x": 760, "y": 300, "id": 2 },
         { "x": 520, "y": 300, "id": 3 },
         { "x": 760, "y": 480, "id": 4 },
         { "x": 520, "y": 540, "id": 5 }
       ],
       "damPosition": { "x": 640, "y": 700 }
     }
   }
   ```
   > 웨이포인트는 1280×720 해상도 기준. S자 형태로 좌우 반복. 개발 중 시각적 확인 후 미세 조정.

**테스트**:
- JSON 데이터 스키마 검증 테스트 (모든 필수 필드 존재 확인)
- 타입 호환성 테스트 (JSON → TypeScript 타입 안전한 변환)
- maps.json의 웨이포인트가 게임 해상도 내에 있는지 검증
- stages.json의 적 타입이 enemies.json에 모두 존재하는지 검증

**완료 기준**:
- 모든 타입이 정의되고 JSON 데이터가 타입과 일치
- 스키마 검증 테스트 통과

---

### Phase 2: 핵심 시스템 (Core)

**목표**: Phaser에 의존하지 않는 순수 게임 로직 핵심 모듈 완성

**작업 목록**:

#### 2-1. EventBus
- 타입 안전 이벤트 발행/구독 시스템
- 이벤트 목록:
  ```typescript
  interface GameEvents {
    enemyKilled: { enemyId: string; goldEarned: number };
    enemyReachedDam: { enemyId: string };
    towerPlaced: { slotIndex: number; towerType: TowerType };
    towerSold: { slotIndex: number; goldRefunded: number };
    towerUpgraded: { slotIndex: number; upgradeType: UpgradeType };
    waveStart: { stageId: number; waveIndex: number };
    waveEnd: { stageId: number; waveIndex: number };
    stageStart: { stageId: number };
    stageEnd: { stageId: number };
    damDamaged: { damage: number; remainingHp: number };
    gameOver: {};
    victory: { score: number; stars: number };
    goldChanged: { amount: number; total: number };
  }
  ```
- **테스트**: 발행/구독/해제, 다중 리스너, 이벤트 데이터 타입 안전성, once 리스너

#### 2-2. GameState (DI 패턴)
- **생성자에서 의존성 주입**: `new GameState(eventBus, goldManager)`
- 상태 필드:
  ```typescript
  gold: number;
  damHp: number;
  damMaxHp: number;           // 200
  currentStage: number;
  currentWave: number;
  gameStatus: 'menu' | 'preparing' | 'playing' | 'paused' | 'gameOver' | 'victory';
  speed: 1 | 2;
  towers: Map<number, Tower>; // slotIndex → Tower
  enemies: Enemy[];
  projectiles: Projectile[];
  elapsedTime: number;        // 총 경과 시간 (초) - 별 평가용
  totalGoldEarned: number;    // 총 획득 골드 - 별 평가용
  ```
- `reset()` → 초기 상태로 리셋
- **테스트**: 초기화, 상태 변경, DI로 mock eventBus 주입 후 이벤트 발행 확인

#### 2-3. DamageCalculator
- `calculateDamage(atk: number, attackType: AttackType, def: number, mdef: number): number`
  - 물리: `max(1, atk - def)`
  - 마법: `max(1, atk - mdef)`
- `calculatePoisonDamage(dps: number): number` → 방어력 무시, 고정 데미지 반환
- **테스트**: 물리 vs 물리방어, 마법 vs 마법방어, 최소 1 데미지, 독 고정 데미지, 방어력 0인 경우, 방어력이 공격력보다 높은 경우

#### 2-4. GoldManager (DI 패턴)
- `new GoldManager(eventBus, initialGold: 220)`
- `canAfford(cost)`, `spend(cost)`, `earn(amount)`, `getBalance()`
- `calculateRefund(totalCost: number): number` → `Math.floor(totalCost * 0.5)`
- **테스트**: 골드 추가, 차감, 부족 시 실패, 판매 환불 계산, 이벤트 발행 확인

#### 2-5. ScoreCalculator
- 별 평가 점수 계산 (GDD 3.4절):
  ```typescript
  calculateScore(damHp: number, damMaxHp: number, goldRemaining: number, maxGold: number, elapsedTime: number, parTime: number): number
  // score = (damHp/damMaxHp)*50 + (goldRemaining/maxGold)*25 + (parTime/elapsedTime)*25
  // 최소 0, 최대 100
  ```
- `getStars(score: number): 1 | 2 | 3` → 80+ → 3별, 50+ → 2별, 클리어 → 1별
- `parTime`: 1800초 (30분) 기준
- `maxGold`: stages.json에서 총 적 골드 합산으로 자동 계산
- **테스트**: 각 별 등급 경계값, 만점, 최저점, parTime 초과 시

**완료 기준**:
- 5개 core 모듈 구현 + 테스트 전체 통과
- Phaser import 없음 (순수 TypeScript)

---

### Phase 3: 경로 시스템 (PathSystem)

**목표**: S자 강 경로와 타워 슬롯 위치 시스템 완성

**작업 목록**:
1. `PathSystem.ts`:
   - `constructor(mapData: MapConfig)` → maps.json 데이터 주입
   - `getPositionAtProgress(t: number): Position` → 0~1 사이 값으로 경로상 좌표 반환 (웨이포인트 간 선형 보간)
   - `getProgressAtPosition(pos: Position): number` → 가장 가까운 경로 지점의 progress 반환
   - `getTotalPathLength(): number` → 전체 경로 길이 (px)
   - `getSpeedAsProgress(speed: number): number` → `speed * SPEED_UNIT / totalPathLength` (speed를 progress/초로 변환)
   - `getTowerSlots(): TowerSlot[]` → 6개 슬롯 좌표
   - `getDamPosition(): Position` → 댐 좌표
   - `isInRange(from: Position, to: Position, range: number): boolean` → 사거리 내 여부

2. `src/utils/math.ts`:
   - `distance(a: Position, b: Position): number` → 유클리드 거리
   - `lerp(a: number, b: number, t: number): number` → 선형 보간
   - `lerpPosition(a: Position, b: Position, t: number): Position`
   - `normalize(v: Position): Position` → 벡터 정규화
   - `isInCone(origin: Position, direction: Position, target: Position, angle: number, range: number): boolean` → 원뿔 범위 판정 (화염마법사용)

**테스트**:
- progress 0 = 시작점(640, 0), progress 1 = 댐 위치(640, 700 부근)
- 웨이포인트 사이 보간 정확성 (중간점 좌표 검증)
- `getSpeedAsProgress` 정확성: SPD 5인 적의 초당 progress 증가량
- `isInRange`: 사거리 경계값 테스트
- `isInCone`: 원뿔 범위 내/외 판정
- 6개 타워 슬롯이 경로 위가 아닌 경로 **옆**에 있는지 (경로와 최소 거리 확인)

**완료 기준**:
- 경로 시스템 테스트 전체 통과
- 경로 위의 임의 지점 좌표를 정확히 계산

---

### Phase 4: 엔티티 - 적 (Enemy) + 오브젝트 풀

**목표**: 적 엔티티, 댐, 오브젝트 풀 완성

**작업 목록**:

#### 4-1. ObjectPool
- 제네릭 풀: `ObjectPool<T>`
- `acquire(): T` → 풀에서 꺼내거나 새로 생성
- `release(obj: T)` → 풀에 반환 (상태 리셋)
- `clear()` → 풀 비우기
- **테스트**: acquire/release 사이클, 풀 재사용 확인

#### 4-2. Enemy
- **상태 머신**: `moving` → `blocked` (병사에 의해) → `moving` → `attackingDam` → `dead`
  ```
  moving: 경로를 따라 이동. progress += speedAsProgress * dt
  blocked: 병사와 교전 중. 이동 멈춤. 병사를 공격.
  attackingDam: 댐에 도달. 이동 멈춤. 댐을 공격. (progress >= 1.0)
  dead: 사망. 풀에 반환 대기.
  ```
- 속성: `id`, `config`, `hp`, `maxHp`, `position`, `progress`, `status`, `effects[]`, `attackCooldown`
- `update(dt: number, pathSystem: PathSystem)`:
  - `moving` → progress 증가, position 갱신
  - `blocked` → 공격 쿨다운 처리, 병사 공격
  - `attackingDam` → 댐에 `atk * attackSpeed * dt` 데미지
- `takeDamage(amount: number, type: AttackType): DamageResult`
- `applyEffect(effect: Effect)` → 중복 적용 시 타이머 갱신
- `getEffectiveSpeed(): number` → 둔화 효과 반영된 실제 속도
- `reset()` → 풀 반환 시 상태 초기화

#### 4-3. EnemyFactory
- `createEnemy(type: EnemyType, pool: ObjectPool<Enemy>): Enemy`
- enemies.json에서 config 로드

#### 4-4. Dam
- `hp: 200`, `maxHp: 200`
- `takeDamage(amount: number): void`
- `isDestroyed(): boolean`
- `getHpPercent(): number`

**테스트**:
- 적 9종 생성 시 올바른 스탯
- 상태 전이: `moving → attackingDam` (progress >= 1.0)
- 상태 전이: `moving → blocked → moving` (병사 교전/사망)
- 이동: dt에 따른 progress 증가, SPD에 비례
- 피격: DamageCalculator 통한 데미지 계산, 사망(hp <= 0)
- 독 효과: 초당 3 고정 데미지, 5초 지속, 재피격 시 타이머 초기화
- 둔화 효과: 이동속도 30% 감소, 공격속도 20% 감소, 3초 지속
- 댐 도달 → attackingDam 상태 → 댐 체력 감소
- 댐 파괴 → gameOver 이벤트
- ObjectPool: Enemy acquire → kill → release → acquire 재사용

**완료 기준**:
- 9종 적 전부 생성/이동/피격/사망/상태전이 테스트 통과
- 오브젝트 풀 동작 확인

---

### Phase 5: 엔티티 - 타워 & 투사체 (Tower, Projectile)

**목표**: 타워 4종 + 8종 업그레이드, 투사체 시스템 완성 (전사 병사 제외)

**작업 목록**:

#### 5-1. Tower
- 속성: `config`, `position`, `slotIndex`, `level` ('base' | UpgradeType), `totalCost`, `attackCooldown`, `lastAttackTime`
- `findTarget(enemies: Enemy[]): Enemy | null` → First 타겟팅 (사거리 내, progress 가장 높은 적)
- `findAoeTargets(enemies: Enemy[], primary: Enemy): Enemy[]` → 주 타겟 주변 aoeRadius 내 최대 maxTargets체
- `canAttack(currentTime: number): boolean` → 쿨다운 체크
- `getEffectiveAttackSpeed(): number` → 아나콘다 디버프 반영

#### 5-2. 특수 타워 메커니즘 상세

**화염마법사 (cone 타겟팅)**:
```
- targetMode: 'cone'
- 동작: 타워가 가장 가까운 적 방향을 바라봄
- 원뿔 범위: 반경 3.5타일, 각도 60도
- 판정: math.isInCone()으로 원뿔 내 모든 적에게 초당 15 데미지
- 지속 공격: 범위 내 적이 있는 한 계속 데미지 적용 (쿨다운 없음)
```

**통나무 타워 (line 타겟팅)**:
```
- targetMode: 'line'
- 동작: 3초 쿨다운마다 통나무 생성
- 통나무는 타워 위치에서 경로를 따라 아래쪽으로 이동 (속도: 300px/초)
- 통나무 이동 경로상의 모든 적에게 17 물리 데미지
- 통나무는 댐에 도달하면 소멸
- 통나무 판정 범위: 경로 중심에서 반경 0.5타일
```

**박격포 타워**:
```
- targetMode: 'aoe'
- range: 7.0 타일 (XL)
- aoeRadius: 2.0 타일
- maxTargets: 10
- 일반 광역 타워와 동일하지만 사거리가 매우 김
```

#### 5-3. TowerFactory
- `createTower(type: TowerType, slotIndex: number, pathSystem: PathSystem): Tower`
- `upgradeTower(tower: Tower, upgradeType: UpgradeType): Tower` → 스탯 변경, totalCost 누적

#### 5-4. Projectile
- 속성: `origin`, `target`, `position`, `speed` (800px/초), `damage`, `attackType`, `isAoe`, `aoeRadius`, `effect?`
- `update(dt)` → 타겟 방향으로 이동
- `hasReachedTarget(): boolean` → 타겟 위치 도달 여부 (거리 < 5px)
- `reset()` → 풀 반환용
- 타입별: 단일 투사체(화살, 볼트), 광역 투사체(폭탄, 박격포탄)
- 오브젝트 풀 적용: `ObjectPool<Projectile>`

**테스트**:
- 타워 4종 + 8종 업그레이드 생성 시 올바른 스탯
- First 타겟팅: 사거리 내 progress 최대 적 선택
- 사거리 밖 적 무시
- 공격 쿨다운: AS 2.0 → 0.5초 간격
- 광역 타격: aoeRadius 내 최대 maxTargets체
- 화염마법사: 원뿔 범위 내 적에게 지속 데미지
- 통나무: 경로 따라 이동, 경로상 적 타격
- 박격포: XL 사거리 + 광역
- 투사체 이동 → 타겟 도달 → 데미지 적용
- 투사체 풀링: acquire/release 사이클
- 아나콘다 디버프: 타워 AS 0.3 감소 반영

**완료 기준**:
- 4종 기본 타워 + 8종 업그레이드 생성/공격 테스트 통과
- 투사체 생성/이동/타격/풀링 테스트 통과
- 특수 타워 메커니즘(화염, 통나무, 박격포) 테스트 통과

---

### Phase 6: 엔티티 - 전사비버 병사 (Soldier)

**목표**: 킹덤러쉬 방식 전사비버 병사 메커니즘 완성

**작업 목록**:

#### 6-1. Soldier
- 속성: `config (SoldierConfig)`, `position`, `rallyPoint`, `status`, `target`, `hp`, `attackCooldown`, `respawnTimer`
- **상태 머신**:
  ```
  idle: 집결지점에서 대기. 반경 1.5타일 내 적 탐색.
  movingToRally: 스폰/리스폰 후 집결지점으로 이동 (속도: 128px/초)
  engaging: 적과 1:1 교전 중. 적이 죽거나 병사가 죽을 때까지.
  dead: 사망. respawnTimer 시작 (30초).
  ```

#### 6-2. 전사 교전 규칙 (상세)
```
1. 적이 집결지점 반경 1.5타일에 진입하면:
   - 유휴(idle) 상태인 병사 1명이 해당 적에게 배정
   - 적의 status가 'blocked'로 변경 → 이동 멈춤
   - 병사와 적이 서로 공격 (각자의 ATK × AS)

2. 1:1 매칭 규칙:
   - 병사 1명 = 적 1마리 전담
   - 기본 전사타워: 병사 3마리 → 최대 3마리 동시 차단
   - 기사타워: 병사 3마리 → 최대 3마리
   - 슈트타워: 병사 1마리 → 최대 1마리

3. 교전 중이 아닌 적은 그대로 통과:
   - 모든 병사가 교전 중이면 추가 적은 차단 없이 통과

4. 적 사망 시:
   - 병사 교전 해제 → idle로 복귀 → 다음 적 탐색

5. 병사 사망 시:
   - 적의 status가 'moving'으로 복귀 → 이동 재개
   - 30초 후 리스폰 (타워에서 출발 → 집결지점으로 이동)

6. 집결지점 이동:
   - 플레이어가 타워 반경 2.0타일 내에서 드래그로 이동 가능
   - 이동 시 모든 유휴 병사가 새 위치로 이동
```

#### 6-3. 슈트비버 기절 메커니즘
```
- 5초 쿨다운마다 반경 1.5타일 내 모든 적에게 2초 기절 적용
- 기절: 이동/공격 완전 정지
- 기절 중인 적에게 중복 기절 적용 시 타이머 갱신
```

**테스트**:
- 병사 생성 (3마리 또는 1마리)
- 병사 집결지점 이동
- 적 접근 → 병사 배정 → 적 blocked → 교전
- 1:1 매칭: 3마리 병사 = 최대 3마리 차단
- 모든 병사 교전 중 → 추가 적 통과
- 적 사망 → 병사 idle → 다음 적
- 병사 사망 → 적 moving 복귀 → 30초 후 리스폰
- 슈트비버: 5초마다 기절, 반경 1.5 내 모든 적 대상
- 기사: HP 100, ATK 9, DEF 15로 올바른 전투
- 리스폰 타이머: 이미 살아있으면 리스폰 안 함

**완료 기준**:
- 전사/기사/슈트 3종 병사 메커니즘 전체 테스트 통과
- 교전/차단/리스폰 로직 통과

---

### Phase 7: 타워 배치 & 경제 시스템

> **[비평 반영]** 기존 Phase 8에서 Phase 7로 앞당김. 전투 시스템 전에 경제를 먼저 검증.

**목표**: 타워 배치, 업그레이드, 판매 로직 완성

**작업 목록**:

#### 7-1. TowerPlacementSystem
- `constructor(gameState, goldManager, towerFactory, pathSystem)`
- 6개 슬롯 관리: `Map<number, Tower | null>`
- `placeTower(slotIndex, towerType): boolean` → 골드 확인 → 차감 → 타워 생성 → 이벤트 발행
- `sellTower(slotIndex): number` → 타워 제거 → 50% 환불 → 골드 추가 → 이벤트 발행
- `isSlotEmpty(slotIndex): boolean`
- `getAffordableTowers(): TowerType[]` → 현재 골드로 구매 가능한 타워 목록

#### 7-2. UpgradeSystem
- `constructor(gameState, goldManager, towerFactory)`
- `getAvailableUpgrades(slotIndex): UpgradeType[]` → 해당 타워의 업그레이드 선택지
- `upgradeTower(slotIndex, upgradeType): boolean` → 골드 확인 → 차감 → 업그레이드 적용
- `isUpgraded(slotIndex): boolean`

**테스트**:
- 빈 슬롯에 타워 배치 → 골드 차감 + 이벤트
- 이미 타워가 있는 슬롯 → 실패
- 골드 부족 → 실패
- 타워 판매 → `Math.floor(totalCost * 0.5)` 환불
- 업그레이드 → 스탯 변경 + 골드 차감
- 이미 업그레이드된 타워 → 추가 업그레이드 불가
- 업그레이드된 타워 판매 → (기본 비용 + 업그레이드 비용) × 50%
- 경제 시뮬레이션: 220골드 시작 → 타워 배치 → 골드 수입 → 업그레이드 → 판매

**완료 기준**:
- 배치/판매/업그레이드 모든 케이스 테스트 통과
- 경제 통합 테스트 통과

---

### Phase 8: 전투 시스템 + 상태이상 (CombatSystem + EffectSystem)

> **[비평 반영]** 기존 Phase 6에서 Phase 8로 이동. 배치/경제 후 전투 구현.
> CombatSystem에서 EffectSystem을 분리하여 God object 방지.

**목표**: 타워-적 전투 루프, 상태이상, 보스 특수능력 완성

**작업 목록**:

#### 8-1. EffectSystem
- `update(dt, enemies[])` → 모든 적의 활성 효과 틱 처리
- 독: `enemy.takeDamage(dps * dt, 'physical')` (방어 무시)
- 둔화: `enemy.getEffectiveSpeed()` 반영
- 기절: 적의 이동/공격 차단
- 화상: 별도 DPS 틱
- 타이머 만료 시 효과 제거
- **테스트**: 독 틱 데미지, 둔화 이동속도 감소, 기절 정지, 효과 만료 제거, 중복 효과 타이머 갱신

#### 8-2. CombatSystem
- `constructor(damageCalculator, effectSystem, eventBus)`
- `update(dt, gameState)`:
  ```
  1. 각 타워 → findTarget → canAttack → attack → 투사체 생성/즉시 데미지
  2. 투사체 업데이트: 이동 → 타격 판정 → 데미지/효과 적용
  3. 병사 업데이트: 교전/리스폰 처리 (SoldierSystem 위임)
  4. 댐 공격: attackingDam 상태 적의 지속 공격 처리
  5. 사망 처리: hp <= 0 → 골드 지급 → 이벤트 → 풀 반환
  ```
- 보스 특수능력:
  - 아나콘다: `update` 시 반경 3.0타일 내 타워 목록 → `tower.getEffectiveAttackSpeed()`에 -0.3 디버프 적용/해제

#### 8-3. GameLoopManager
- 모든 시스템을 조율하는 매니저 (GameScene의 책임 경감)
- `update(dt)`:
  ```
  1. spawnSystem.update(dt)
  2. enemies.forEach(e => e.update(dt))
  3. soldiers.forEach(s => s.update(dt))
  4. combatSystem.update(dt, gameState)
  5. effectSystem.update(dt, enemies)
  6. projectiles.forEach(p => p.update(dt))
  7. waveSystem.check()
  8. stageSystem.check()
  9. gameState.elapsedTime += dt
  ```

**테스트**:
- 타워가 적을 공격 → 처치 → 골드 획득
- 광역 타워: 범위 내 다수 적 동시 공격
- 화염마법사: 원뿔 범위 지속 데미지
- 통나무: 경로 굴림 → 경로상 적 타격
- 적이 댐 도달 → 지속 공격 → 댐 체력 감소
- 독/둔화/기절 정확한 동작
- 아나콘다 오라: 범위 내 타워 AS 감소, 범위 밖 복구
- 복합 시나리오: 여러 타워 + 여러 적 + 보스 + 상태이상 조합
- GameLoopManager: 시스템 업데이트 순서 검증

**완료 기준**:
- 전투 시스템 + 상태이상 통합 테스트 통과
- 보스 특수능력 테스트 통과
- combat-scenarios.test.ts 통합 테스트 통과

---

### Phase 9: Wave & 스테이지 시스템

**목표**: Wave 진행, 스테이지 전환, 게임 흐름 관리 완성

**작업 목록**:

#### 9-1. SpawnSystem
- `constructor(enemyFactory, pathSystem, objectPool)`
- `startWave(waveConfig: WaveConfig)` → 스폰 큐 초기화
- `update(dt)` → 스폰 간격에 따라 적 생성
- 스폰 간격 규칙:
  ```
  피라냐, 메기: 0.3초 간격 (약한 적)
  이구아나, 물뱀: 0.5초 간격 (중간 적)
  거북, 크로커다일, 하마: 1.5초 간격 (강한 적)
  아나콘다, 코끼리: Wave 마지막에 단독 스폰, 3초 딜레이
  ```
- 적 종류별로 섞어서 스폰 (약한 적 → 중간 적 → 강한 적 → 보스 순서)
- `isSpawnComplete(): boolean` → 모든 적 스폰 완료 여부
- 적 스폰 위치: progress = 0 (경로 시작점)

#### 9-2. WaveSystem
- 상태 머신: `preparing` → `spawning` → `inProgress` → `cleared`
- `preparing`: 플레이어가 타워 배치/업그레이드/판매 가능. "다음 Wave 시작" 버튼 대기. **시간 제한 없음**.
- `spawning`: SpawnSystem이 적을 스폰 중
- `inProgress`: 스폰 완료, 남은 적 전투 중
- `cleared`: 모든 적 사망 (스폰 완료 + 생존 적 0)
- `startNextWave()` → preparing → spawning 전환

#### 9-3. StageSystem
- `preparing` → `playing` → `cleared`
- 3 Wave 모두 cleared → 스테이지 cleared
- 다음 스테이지 자동 전환 (preparing 상태로)
- 보너스 골드: Stage 4 시작 시 +200, Stage 9 시작 시 +400
- Stage 10 Wave 3 cleared → 게임 승리 → ScoreCalculator로 점수 산출

**테스트**:
- 스폰: 올바른 적 종류/수, 스폰 간격 규칙 준수
- Wave 흐름: preparing → spawning → inProgress → cleared
- 스테이지 전환: 골드 유지, 타워 유지, Wave 1 preparing으로
- 보너스 골드: Stage 4 시작 시 +200, Stage 9 시작 시 +400
- 10스테이지 클리어 → victory 이벤트 + 점수/별 계산
- 댐 파괴 → gameOver 이벤트 (어떤 스테이지/Wave든)
- 게임 시간 추적: elapsedTime 정확히 누적 (일시정지 시 제외)

**완료 기준**:
- 1~10 스테이지 전체 흐름 시뮬레이션 테스트 통과
- 게임 오버/승리/별 평가 테스트 통과

---

### Phase 10: Phaser 렌더링 - 맵 & 기본 비주얼

**목표**: 게임 맵, 강, 댐, 타워 슬롯이 화면에 표시

**작업 목록**:
1. `BootScene.ts`:
   - 에셋 프리로더 (플레이스홀더 도형 생성)
   - 한국어 웹폰트 로딩 (`WebFontLoader` 또는 CSS @font-face)
   - 프로그레스바 표시
2. `GameScene.ts`:
   - 배경 렌더링 (강: 파란색 경로, 양쪽 땅: 초록색)
   - S자 강 경로 시각화 (Graphics로 PathSystem 웨이포인트 연결)
   - 댐 렌더링 (하단, 체력바 포함)
   - 6개 타워 슬롯 렌더링 (+버튼, 점선 사각형)
   - 카메라: 1280×720 고정, ScaleManager.FIT
3. **플레이스홀더 그래픽** (도형):
   - 적: 색상별 원 (피라냐=빨강, 메기=파랑, ...)
   - 타워: 색상별 사각형
   - 투사체: 작은 원
   - HP바: 적 머리 위 얇은 바
   - 댐: 갈색 직사각형
4. `renderers/` 디렉토리:
   - `EnemyRenderer.ts`: Enemy 로직 객체 ↔ Phaser Sprite 래퍼
     ```typescript
     class EnemyRenderer extends Phaser.GameObjects.Container {
       private enemy: Enemy;  // 로직 객체 참조
       private sprite: Phaser.GameObjects.Arc; // 플레이스홀더
       private hpBar: Phaser.GameObjects.Graphics;
       syncWithLogic() { /* enemy.position → this.setPosition */ }
     }
     ```
   - `TowerRenderer.ts`, `ProjectileRenderer.ts`, `SoldierRenderer.ts`, `EffectRenderer.ts`

**완료 기준**:
- 브라우저에서 1280×720 화면에 S자 강, 댐, 6개 타워 슬롯 보임
- 한국어 텍스트 정상 렌더링

---

### Phase 11: Phaser 렌더링 - 게임 플레이 통합

**목표**: 로직과 렌더링 연결, 실제 플레이 가능한 프로토타입

**작업 목록**:

#### 11-A. 기본 연결
1. GameScene에 GameLoopManager 연결
2. `GameScene.update(time, delta)`:
   ```typescript
   const dt = (delta / 1000) * this.gameState.speed; // 배속 반영
   if (this.gameState.gameStatus === 'playing') {
     this.gameLoopManager.update(dt);
   }
   this.syncRenderers(); // 로직 → 렌더링 동기화
   ```
3. 적 렌더링: EnemyRenderer가 Enemy.position 추적, HP바 갱신
4. 타워 렌더링: 설치 시 생성, 판매 시 제거
5. 투사체 렌더링: 생성 → 이동 → 타격 시 제거
6. 입력 처리: 타워 슬롯 클릭 → 팔레트 이벤트

#### 11-B. 효과 & 보스
7. 전사 병사 렌더링: 집결지점 이동, 교전 시각화
8. 이펙트 렌더링: 독(초록 틴트), 둔화(파란 틴트), 기절(별 아이콘), 화염(주황 파티클)
9. 보스 렌더링: 크기 2배/4배, 등장 연출
10. 배속 기능: speed 1/2 전환 버튼
11. 일시정지: gameStatus 'paused' 시 dt = 0

**완료 기준**:
- Stage 1을 플레이스홀더 그래픽으로 처음부터 끝까지 플레이 가능
- 타워 배치 → 적 스폰 → 전투 → Wave 클리어 → 다음 Wave → 스테이지 전환 동작
- 일시정지/배속 동작

---

### Phase 12: UI 시스템 + 디버그 도구

**목표**: 모든 UI 컴포넌트 + 개발용 디버그 패널 완성

**작업 목록**:

#### 12-1. 게임 HUD
- 골드 (좌상단): 코인 아이콘 + 숫자
- 스테이지/Wave (상단 중앙): "Stage 3 - Wave 2/3"
- 댐 체력바 (우상단): 색상 변화 (초록→노랑→빨강)
- 남은 적 수 (우측): 적 아이콘 + 숫자
- 일시정지/배속 (하단 우측)

#### 12-2. 타워 팔레트
- +버튼 클릭 → 4종 타워 아이콘 원형 배치
- 각 아이콘: 타워 이미지 + 가격 텍스트
- 골드 부족 시: 아이콘 회색 + 가격 빨간색
- 선택 시: 사거리 범위 원형 미리보기 (반투명 원)
- 바깥 클릭 시 팔레트 닫기

#### 12-3. 업그레이드 팔레트
- 설치된 타워 클릭 → 업그레이드 2갈래 아이콘 + 판매 아이콘
- 각 업그레이드: 이름 + 가격 + 변경될 스탯 미리보기
- 판매 버튼: 환불 금액 표시
- 현재 타워 스탯 정보 패널

#### 12-4. 집결지점 드래그 (RallyPointDragger)
- 전사 타워 클릭 시 집결지점 깃발 표시
- 깃발 드래그 → 타워 반경 2.0타일 내 제한 이동
- 드래그 중 반경 원 표시

#### 12-5. Wave 시작 버튼
- preparing 상태에서 화면 하단 중앙에 "다음 Wave!" 버튼
- 클릭 → waveSystem.startNextWave()

#### 12-6. 시작 화면 (MenuScene)
- 타이틀 로고 ("비버들의 댐막기 대작전")
- 시작 버튼 → GameScene 전환
- 설정 버튼 → BGM/효과음 볼륨 슬라이더 팝업
- 최고 기록: 별 평가 히스토리 (localStorage에 저장)
- 크레딧 버튼

#### 12-7. 게임 오버 / 클리어 화면
- **GameOverScene**: 댐 파괴 연출 + "게임 오버" + 재시작/메인 버튼
- **VictoryScene**: 별 연출 (1~3별 애니메이션) + 점수 상세 (댐 HP, 골드, 시간) + 재시작/메인

#### 12-8. 디버그 패널 (개발 전용)
- `import.meta.env.DEV` 조건부 표시
- 기능: 골드 추가(+1000), 스테이지 스킵, Wave 스킵, 적 전체 처치, 댐 체력 리셋, 시간 조절

**완료 기준**:
- 모든 UI가 동작하고 게임 흐름과 연동
- 시작 화면 → 게임 → (10스테이지) → 클리어/게임오버 전체 루프 동작
- 집결지점 드래그 동작
- 디버그 패널 동작 (DEV 모드에서만)

---

### Phase 13: 오디오 & 비주얼 폴리시

**목표**: 사운드, 에셋 교체, 시각 효과 완성

> **참고**: 스프라이트/오디오 에셋 제작은 코드 구현과 별개 프로세스입니다.
> AI Agent가 코드로 생성 가능한 것(SVG, Canvas 드로잉, 프로시저럴 사운드)과
> 외부 제작이 필요한 것(상세 일러스트, BGM 작곡)을 구분합니다.

**작업 목록**:

#### 13-1. 프로시저럴 스프라이트 (AI Agent 구현 가능)
- Canvas API 또는 SVG로 카툰 스타일 스프라이트 생성
- 타워 4종 + 8종 업그레이드 (귀여운 비버 캐릭터)
- 적 9종 (귀여운 동물)
- 맵 요소 (강, 땅, 나무, 댐)
- UI 아이콘 (골드 코인, 하트, 별 등)
- 투사체 (화살, 볼트, 폭탄, 불, 얼음)

#### 13-2. 애니메이션
- 적 이동 (프레임 애니메이션 또는 트윈)
- 타워 공격 모션
- 적 사망 이펙트 (파티클)
- 보스 등장 연출 (화면 흔들림 + 경고)
- 골드 획득 이펙트 (+숫자 팝업)
- 댐 피격 이펙트 (화면 살짝 빨갛게)
- 업그레이드 이펙트 (빛 효과)

#### 13-3. 오디오
- BGM: 웹 오디오 API 또는 Phaser 사운드 매니저
  - 메인 화면 BGM
  - 일반 스테이지 BGM
  - 보스 스테이지 BGM (Stage 5, 10)
- 효과음: 타워 설치, 업그레이드, 판매, 공격(타워별), 적 사망, 보스 등장, Wave 시작, 댐 피격, 게임 오버, 클리어
- 볼륨 조절: MenuScene 설정과 연동
- **에셋 형식**: OGG + MP3 (브라우저 호환)

#### 13-4. 메모리 관리
- 적 사망/투사체 소멸 시 Phaser 오브젝트 `destroy()` 호출
- 오브젝트 풀 반환 전 렌더러 정리
- Scene 전환 시 이전 Scene 리소스 정리

**완료 기준**:
- 플레이스홀더가 실제 비주얼로 교체됨
- BGM/효과음 재생 + 볼륨 조절
- 메모리 누수 없음 (장시간 플레이 시 프레임 드롭 없음)

---

## 페이즈 의존성 그래프 (v2)

```
Phase 0 (셋업+CI)
  └→ Phase 1 (타입 & 데이터)
       └→ Phase 2 (Core: EventBus, GameState, DamageCalc, GoldMgr, ScoreCalc)
            └→ Phase 3 (경로)
                 └→ Phase 4 (적 + ObjectPool)
                      └→ Phase 5 (타워 & 투사체) ←── 전사 병사 제외
                           ├→ Phase 6 (전사비버 병사) ←── Phase 5 완료 필요
                           └→ Phase 7 (배치 & 경제) ←── Phase 5 완료 필요
                                └→ Phase 8 (전투 + EffectSystem) ←── Phase 6, 7 완료 필요
                                     └→ Phase 9 (Wave & Stage)
                                          └→ Phase 10 (맵 렌더링) ←── Phase 3 데이터 활용
                                               └→ Phase 11 (게임 플레이 통합) ←── Phase 9 완료 필요
                                                    └→ Phase 12 (UI + 디버그)
                                                         └→ Phase 13 (오디오 & 폴리시)
```

- Phase 0~9: **로직 우선** (렌더링 없이 테스트로 검증)
- Phase 10~13: **렌더링 & UI** (로직 위에 시각 레이어 추가)
- Phase 6, 7은 Phase 5 이후 병렬 진행 가능

---

## 테스트 전략

### 단위 테스트 (Unit Tests)
- `core/`: EventBus, GameState, DamageCalculator, GoldManager, ScoreCalculator
- `entities/`: Tower, Enemy, Projectile, Soldier, Dam
- `systems/`: PathSystem, SpawnSystem, CombatSystem, EffectSystem, WaveSystem, StageSystem, TowerPlacementSystem, UpgradeSystem
- `utils/`: ObjectPool, math

### 통합 테스트 (Integration Tests)
- `game-flow.test.ts`: Stage 1 → Stage 10 전체 흐름 (스폰→전투→Wave→Stage→승리)
- `economy.test.ts`: 전체 경제 사이클 (골드 수입/지출/환불 밸런스)
- `combat-scenarios.test.ts`: 복합 전투 시나리오
  - 6타워 + 200마리 적 + 보스 동시 전투
  - 전사 차단 + 광역 타워 + 상태이상 조합
  - 아나콘다 디버프 + 코끼리 탱킹 시나리오

### 렌더링 테스트
- Phase 10~13은 Vitest로 자동 테스트 어려움
- **수동 검증 체크리스트**로 대체 (각 Phase 완료 기준에 명시)
- 가능하면 Phaser Scene mock으로 입력 이벤트 테스트

### 테스트 커버리지 목표
- core/: **100%**
- entities/: **95%+**
- systems/: **90%+**
- utils/: **100%**
- 전체: **85%+**

---

## 마일스톤

| 마일스톤 | 포함 Phase | 검증 방법 | 상태 |
|---|---|---|---|
| M1: 개발 환경 | Phase 0 | CI 통과, Phaser 화면 표시 | 대기 |
| M2: 데이터 & 핵심 로직 | Phase 1~2 | 전체 테스트 통과 | 대기 |
| M3: 엔티티 완성 | Phase 3~6 | 적/타워/병사 테스트 통과 | 대기 |
| M4: 게임 로직 완성 | Phase 7~9 | 10스테이지 시뮬레이션 통과 | 대기 |
| M5: 플레이 가능 프로토타입 | Phase 10~11 | 브라우저에서 풀 플레이 가능 | 대기 |
| M6: UI 완성 | Phase 12 | 전체 UI + 게임 루프 동작 | 대기 |
| M7: 출시 가능 버전 | Phase 13 | 비주얼/오디오 완성, 메모리 안정 | 대기 |

---

## AI Agent 실행 가이드

### 각 Phase 시작 시
1. 이 문서의 해당 Phase 섹션을 읽는다
2. `../GDD.md`에서 관련 데이터/스펙을 확인한다
3. **테스트를 먼저 작성**한다 (TDD)
4. 테스트를 통과하도록 구현한다
5. `npm run lint && npm run format` 실행
6. `npm run test` 전체 통과 확인
7. Phase 완료 기준 달성 확인 후 다음 Phase 진행

### 주의사항
- 각 Phase는 이전 Phase의 테스트가 모두 통과한 상태에서 시작
- **게임 로직**(core, entities, systems)은 Phaser에 의존하지 않도록 구현
- **렌더링**(scenes, renderers, ui)만 Phaser를 사용
- 데이터 변경은 JSON 파일만 수정 (코드 변경 불필요하도록)
- 확장성을 위해 하드코딩 금지 → `constants.ts` + JSON 데이터 활용
- GameState는 반드시 **DI 패턴**으로 구현 (테스트 시 mock 주입)
- **오브젝트 풀링** 적용: Enemy, Projectile, Effect에 ObjectPool 사용
- **메모리 관리**: Phaser 오브젝트 생성/파괴 시 반드시 정리
- DEV 모드에서만 디버그 패널 활성화: `if (import.meta.env.DEV)`
- texts.json을 통해 모든 UI 텍스트 관리 (하드코딩 금지)

### 에셋 관련
- Phase 10~11은 플레이스홀더(도형)로 진행
- Phase 13에서 실제 에셋으로 교체
- 에셋 파일명 규칙: `{category}_{name}.png` (예: `tower_archer.png`, `enemy_piranha.png`)
