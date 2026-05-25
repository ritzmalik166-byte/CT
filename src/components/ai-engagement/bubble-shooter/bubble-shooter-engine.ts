import { BUBBLE_TYPE_COUNT } from "./ai-bubble-logos";

/** Fixed compact playfield — small container, 8 columns. */
export const PLAYFIELD_W = 340;
export const PLAYFIELD_H = 380;
export const GRID_COLS = 8;
export const INITIAL_ROWS = 5;

export type CellKey = string;

export type GridBubble = {
  type: number;
  popT?: number;
};

export type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: number;
};

export type PopParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

export type BubbleShooterState = {
  grid: Map<CellKey, GridBubble>;
  projectile: Projectile | null;
  currentType: number;
  nextType: number;
  score: number;
  angle: number;
  particles: PopParticle[];
  shooting: boolean;
  gameOver: boolean;
  won: boolean;
  combo: number;
};

export type LayoutMetrics = {
  width: number;
  height: number;
  cols: number;
  radius: number;
  rowHeight: number;
  originX: number;
  originY: number;
  shooterY: number;
  dangerY: number;
};

export function cellKey(row: number, col: number): CellKey {
  return `${row},${col}`;
}

export function parseKey(key: CellKey): { row: number; col: number } {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

export function randomType(): number {
  return Math.floor(Math.random() * BUBBLE_TYPE_COUNT);
}

export function computeLayout(width: number, height: number): LayoutMetrics {
  const cols = GRID_COLS;
  const radius = Math.max(12, Math.min(18, Math.floor((width - 32) / (cols * 2 + 1))));
  const rowHeight = radius * Math.sqrt(3);
  const gridWidth = (cols - 0.5) * radius * 2;
  const originX = (width - gridWidth) / 2 + radius;
  const originY = radius + 8;
  const shooterY = height - radius - 14;
  const dangerY = shooterY - radius * 5.5;

  return {
    width,
    height,
    cols,
    radius,
    rowHeight,
    originX,
    originY,
    shooterY,
    dangerY,
  };
}

export function cellCenter(
  row: number,
  col: number,
  layout: LayoutMetrics
): { x: number; y: number } {
  const x =
    layout.originX +
    col * layout.radius * 2 +
    (row % 2 === 1 ? layout.radius : 0);
  const y = layout.originY + row * layout.rowHeight;
  return { x, y };
}

export function neighbors(row: number, col: number): Array<[number, number]> {
  const even = row % 2 === 0;
  if (even) {
    return [
      [row, col - 1],
      [row, col + 1],
      [row - 1, col - 1],
      [row - 1, col],
      [row + 1, col - 1],
      [row + 1, col],
    ];
  }
  return [
    [row, col - 1],
    [row, col + 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];
}

export function createInitialState(cols = GRID_COLS): BubbleShooterState {
  const grid = new Map<CellKey, GridBubble>();

  for (let row = 0; row < INITIAL_ROWS; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      grid.set(cellKey(row, col), { type: randomType() });
    }
  }

  const currentType = randomType();
  let nextType = randomType();
  while (nextType === currentType) nextType = randomType();

  return {
    grid,
    projectile: null,
    currentType,
    nextType,
    score: 0,
    angle: -Math.PI / 2,
    particles: [],
    shooting: false,
    gameOver: false,
    won: false,
    combo: 0,
  };
}

export function findCluster(
  grid: Map<CellKey, GridBubble>,
  startRow: number,
  startCol: number,
  type: number
): Set<CellKey> {
  const startKey = cellKey(startRow, startCol);
  const start = grid.get(startKey);
  if (!start || start.type !== type) return new Set();

  const visited = new Set<CellKey>();
  const stack: Array<[number, number]> = [[startRow, startCol]];

  while (stack.length) {
    const [row, col] = stack.pop()!;
    const key = cellKey(row, col);
    if (visited.has(key)) continue;

    const cell = grid.get(key);
    if (!cell || cell.type !== type) continue;

    visited.add(key);
    for (const [nr, nc] of neighbors(row, col)) {
      if (!visited.has(cellKey(nr, nc))) stack.push([nr, nc]);
    }
  }

  return visited;
}

export function findFloating(grid: Map<CellKey, GridBubble>): Set<CellKey> {
  const anchored = new Set<CellKey>();
  const queue: Array<[number, number]> = [];

  for (const key of grid.keys()) {
    const { row } = parseKey(key);
    if (row === 0) {
      const { row: r, col: c } = parseKey(key);
      queue.push([r, c]);
      anchored.add(key);
    }
  }

  while (queue.length) {
    const [row, col] = queue.shift()!;
    for (const [nr, nc] of neighbors(row, col)) {
      const key = cellKey(nr, nc);
      if (grid.has(key) && !anchored.has(key)) {
        anchored.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  const floating = new Set<CellKey>();
  for (const key of grid.keys()) {
    if (!anchored.has(key)) floating.add(key);
  }
  return floating;
}

export function nearestEmptyCell(
  grid: Map<CellKey, GridBubble>,
  x: number,
  y: number,
  layout: LayoutMetrics
): { row: number; col: number } | null {
  let best: { row: number; col: number; dist: number } | null = null;

  for (let row = 0; row < 14; row++) {
    const colsInRow = row % 2 === 0 ? layout.cols : layout.cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const key = cellKey(row, col);
      if (grid.has(key)) continue;

      let adjacent = false;
      for (const [nr, nc] of neighbors(row, col)) {
        if (grid.has(cellKey(nr, nc))) adjacent = true;
      }
      if (row === 0) adjacent = true;
      if (!adjacent) continue;

      const { x: cx, y: cy } = cellCenter(row, col, layout);
      const dist = (cx - x) ** 2 + (cy - y) ** 2;
      if (!best || dist < best.dist) best = { row, col, dist };
    }
  }

  return best ? { row: best.row, col: best.col } : null;
}

function spawnParticles(
  state: BubbleShooterState,
  x: number,
  y: number,
  color: string,
  count = 8
) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 1.2 + Math.random() * 2.4;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

export function resolvePlacement(
  state: BubbleShooterState,
  row: number,
  col: number,
  type: number,
  layout: LayoutMetrics,
  ringColor: (type: number) => string
) {
  const key = cellKey(row, col);
  state.grid.set(key, { type });

  const cluster = findCluster(state.grid, row, col, type);
  let removed = 0;

  if (cluster.size >= 3) {
    removed = cluster.size;
    state.combo += 1;
    state.score += cluster.size * 10 * state.combo;

    for (const k of cluster) {
      const { row: r, col: c } = parseKey(k);
      const { x, y } = cellCenter(r, c, layout);
      spawnParticles(state, x, y, ringColor(type), 6);
      state.grid.delete(k);
    }
  } else {
    state.combo = 0;
  }

  const floating = findFloating(state.grid);
  if (floating.size) {
    removed += floating.size;
    state.score += floating.size * 15;
    for (const k of floating) {
      const { row: r, col: c } = parseKey(k);
      const cell = state.grid.get(k);
      const { x, y } = cellCenter(r, c, layout);
      if (cell) spawnParticles(state, x, y, ringColor(cell.type), 4);
      state.grid.delete(k);
    }
  }

  if (state.grid.size === 0) {
    state.won = true;
  }

  let lowestY = 0;
  for (const k of state.grid.keys()) {
    const { row, col } = parseKey(k);
    const { y } = cellCenter(row, col, layout);
    lowestY = Math.max(lowestY, y);
  }
  if (lowestY >= layout.dangerY) {
    state.gameOver = true;
  }

  return removed;
}

export function advanceTypes(state: BubbleShooterState) {
  state.currentType = state.nextType;
  state.nextType = randomType();
}

export function updateParticles(state: BubbleShooterState, dt: number) {
  state.particles = state.particles.filter((p) => {
    p.life -= dt * 2.2;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    return p.life > 0;
  });
}

export function stepProjectile(
  state: BubbleShooterState,
  layout: LayoutMetrics,
  ringColor: (type: number) => string
): boolean {
  const proj = state.projectile;
  if (!proj) return false;

  const speed = 7.5;
  proj.x += proj.vx * speed;
  proj.y += proj.vy * speed;

  const r = layout.radius;
  const wallPad = 6;
  const minX = r + wallPad;
  const maxX = layout.width - r - wallPad;

  if (proj.x <= minX || proj.x >= maxX) {
    proj.vx *= -1;
    proj.x = Math.max(minX, Math.min(maxX, proj.x));
  }

  if (proj.y <= layout.originY - r) {
    const cell = nearestEmptyCell(state.grid, proj.x, proj.y, layout);
    if (cell) {
      resolvePlacement(state, cell.row, cell.col, proj.type, layout, ringColor);
      state.projectile = null;
      state.shooting = false;
      advanceTypes(state);
      return true;
    }
  }

  for (const [key, bubble] of state.grid) {
    if (bubble.popT !== undefined) continue;
    const { row, col } = parseKey(key);
    const { x, y } = cellCenter(row, col, layout);
    const dist = Math.hypot(proj.x - x, proj.y - y);
    if (dist < r * 1.85) {
      const cell = nearestEmptyCell(state.grid, proj.x, proj.y, layout);
      if (cell) {
        resolvePlacement(state, cell.row, cell.col, proj.type, layout, ringColor);
      }
      state.projectile = null;
      state.shooting = false;
      advanceTypes(state);
      return true;
    }
  }

  if (proj.y > layout.height + r) {
    state.projectile = null;
    state.shooting = false;
    state.gameOver = true;
  }

  return false;
}

export function shoot(state: BubbleShooterState, layout: LayoutMetrics) {
  if (state.shooting || state.gameOver || state.won) return;

  const cx = layout.width / 2;
  const cy = layout.shooterY;
  const angle = state.angle;

  state.projectile = {
    x: cx,
    y: cy,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    type: state.currentType,
  };
  state.shooting = true;
}

export function swapBubbleTypes(state: BubbleShooterState) {
  if (state.shooting || state.projectile) return;
  const tmp = state.currentType;
  state.currentType = state.nextType;
  state.nextType = tmp;
}

export function aimFromPointer(
  state: BubbleShooterState,
  layout: LayoutMetrics,
  clientX: number,
  clientY: number,
  canvasRect: DOMRect
) {
  const cx = layout.width / 2;
  const cy = layout.shooterY;
  const x = clientX - canvasRect.left;
  const y = clientY - canvasRect.top;

  let angle = Math.atan2(y - cy, x - cx);
  const min = -Math.PI + 0.25;
  const max = -0.25;
  angle = Math.max(min, Math.min(max, angle));
  state.angle = angle;
}
