import { Judgement } from "../../engine/RhythmEngine";

// Canvas constants
export const CANVAS_HEIGHT_DEFAULT = 400;
export const PIANO_HEIGHT = 80;
export const LOOKAHEAD_TIME = 4;

// Piano key constants
export const OFFSET_UNIT = 20;
export const WHITE_KEY_WIDTH = OFFSET_UNIT * 2;
export const BLACK_KEY_WIDTH = OFFSET_UNIT * 1.2;

// Key highlight constants
export const KEY_HIGHLIGHT_MS = 150;

// Drawing constants
export const BLACK_KEY_HEIGHT_RATIO = 0.6;
export const NOTE_AREA_TOP_PADDING = 10;
export const NOTE_AREA_BOTTOM_PADDING = 50;
export const MINIMUM_NOTE_HEIGHT = 20;
export const NOTE_HEIGHT_MULTIPLIER = 30;
export const FEEDBACK_LABEL_OFFSET = 8;
export const BLACK_KEY_LABEL_OFFSET = 12;
export const WHITE_KEY_LABEL_OFFSET = 8;

// Font constants
export const WHITE_KEY_FONT = "10px Arial";
export const BLACK_KEY_FONT = "9px Arial";
export const FEEDBACK_LABEL_FONT = "12px Arial";

// Color constants
export const CANVAS_BACKGROUND_COLOR = "#fafafa";
export const PIANO_STRIP_COLOR = "#e0e0e0";
export const WHITE_KEY_COLOR = "#fff";
export const BLACK_KEY_COLOR = "#000";
export const KEY_STROKE_COLOR = "#000";
export const DEFAULT_AUDIO_HIGHLIGHT_COLOR = "#ffeb3b";
export const YELLOW_COLOR_JUDGEMENT = "#ffd700";
export const GREEN_COLOR_JUDGEMENT = "#4caf50";
export const BLUE_COLOR_JUDGEMENT = "#2196f3";
export const GRAY_COLOR_JUDGEMENT = "#9e9e9e";
export const RED_COLOR_JUDGEMENT = "#f44336";

// Drawing dimensions
export const KEY_STROKE_WIDTH = 1;
export const NOTE_STROKE_WIDTH = 2;

export const JUDGEMENT_INFO: Record<Judgement, { points: number; text: string; color: string }> = {
    perfect: { points: 300, text: "Perfect!", color: YELLOW_COLOR_JUDGEMENT },
    great: { points: 200, text: "Great!", color: GREEN_COLOR_JUDGEMENT },
    good: { points: 100, text: "Good", color: BLUE_COLOR_JUDGEMENT },
    hit: { points: 50, text: "Hit", color: GRAY_COLOR_JUDGEMENT },
    miss: { points: 0, text: "Miss", color: RED_COLOR_JUDGEMENT },
    wrongKey: { points: 0, text: "Wrong Key", color: RED_COLOR_JUDGEMENT },
};