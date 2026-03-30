import type { FixtureVotesResult } from "@/type/fastapi/vote";

/** Bar segment widths (sum 100%). No votes → equal thirds. With votes → each segment at least this % so 0% choices stay visible. */
const MIN_SEGMENT_PCT = 2;

export function barSegmentWidths(
  fixture: FixtureVotesResult,
): [number, number, number] {
  const raw: [number, number, number] = [
    fixture.home_percentage,
    fixture.draw_percentage,
    fixture.away_percentage,
  ];
  if (fixture.total_votes === 0) {
    const third = 100 / 3;
    return [third, third, 100 - 2 * third];
  }
  const floored: [number, number, number] = [
    Math.max(raw[0], MIN_SEGMENT_PCT),
    Math.max(raw[1], MIN_SEGMENT_PCT),
    Math.max(raw[2], MIN_SEGMENT_PCT),
  ];
  const sum = floored[0] + floored[1] + floored[2];
  return [
    (floored[0] / sum) * 100,
    (floored[1] / sum) * 100,
    (floored[2] / sum) * 100,
  ];
}
