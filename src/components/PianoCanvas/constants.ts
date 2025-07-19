import { Judgement } from "../../engine/RhythmEngine";

export const CANVAS_HEIGHT_DEFAULT = 400;
export const PIANO_HEIGHT = 80;
export const LOOKAHEAD_TIME = 4;

export const OFFSET_UNIT = 20;
export const WHITE_KEY_WIDTH = OFFSET_UNIT * 2;
export const BLACK_KEY_WIDTH = OFFSET_UNIT * 1.2;

export const KEY_HIGHLIGHT_MS = 150;

export const JUDGEMENT_INFO: Record<Judgement, { points: number; text: string; color: string }> = {
    perfect: { points: 300, text: "Perfect!", color: "#ffd700" },
    great: { points: 200, text: "Great!", color: "#4caf50" },
    good: { points: 100, text: "Good", color: "#2196f3" },
    hit: { points: 50, text: "Hit", color: "#9e9e9e" },
    miss: { points: 0, text: "Miss", color: "#f44336" },
    wrongKey: { points: 0, text: "Wrong Key", color: "#f44336" },
};