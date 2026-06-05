import { PUZZLE_GRID_SIZE } from "./puzzle-images";

export const EMPTY_TILE = PUZZLE_GRID_SIZE * PUZZLE_GRID_SIZE - 1;

export function solvedTiles(size = PUZZLE_GRID_SIZE): number[] {
  return Array.from({ length: size * size }, (_, i) => i);
}

function countInversions(tiles: number[], size: number): number {
  const filtered = tiles.filter((t) => t !== EMPTY_TILE);
  let inversions = 0;
  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) inversions++;
    }
  }
  return inversions;
}

export function isSolvable(tiles: number[], size = PUZZLE_GRID_SIZE): boolean {
  const inversions = countInversions(tiles, size);
  if (size % 2 === 1) return inversions % 2 === 0;

  const blankIndex = tiles.indexOf(EMPTY_TILE);
  const blankRowFromBottom = size - Math.floor(blankIndex / size);
  return (inversions + blankRowFromBottom) % 2 === 1;
}

export function isSolved(tiles: number[], size = PUZZLE_GRID_SIZE): boolean {
  return tiles.every((tile, index) => tile === index);
}

export function shuffleTiles(size = PUZZLE_GRID_SIZE): number[] {
  const solved = solvedTiles(size);
  let tiles: number[];

  do {
    tiles = [...solved];
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable(tiles, size) || isSolved(tiles, size));

  return tiles;
}

export function canSlide(tiles: number[], index: number, size = PUZZLE_GRID_SIZE): boolean {
  const emptyIndex = tiles.indexOf(EMPTY_TILE);
  const row = Math.floor(index / size);
  const col = index % size;
  const emptyRow = Math.floor(emptyIndex / size);
  const emptyCol = emptyIndex % size;

  return (
    (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
    (col === emptyCol && Math.abs(row - emptyRow) === 1)
  );
}

export function slideTile(tiles: number[], index: number): number[] {
  if (!canSlide(tiles, index)) return tiles;

  const next = [...tiles];
  const emptyIndex = next.indexOf(EMPTY_TILE);
  [next[index], next[emptyIndex]] = [next[emptyIndex], next[index]];
  return next;
}

export function tileBackgroundPosition(tileValue: number, size = PUZZLE_GRID_SIZE): string {
  const col = tileValue % size;
  const row = Math.floor(tileValue / size);
  const x = size === 1 ? 0 : (col / (size - 1)) * 100;
  const y = size === 1 ? 0 : (row / (size - 1)) * 100;
  return `${x}% ${y}%`;
}
