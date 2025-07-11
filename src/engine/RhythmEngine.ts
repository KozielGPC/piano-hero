export interface NoteEvent {
  id: string;
  keys: string[]; // keys involved (single note => 1 element, chord => many)
  start: number; // seconds when the note should be hit
  end?: number; // for future hold-note support
}

// Accuracy buckets returned by the engine.  Ordered from best to worst (excluding errors).
export type Judgement =
  | "perfect" // ±20 ms (very accurate)
  | "great" // ±50 ms
  | "good" // ±100 ms
  | "hit" // within the loose window (<= late)
  | "miss" // outside the timing window for the expected key
  | "wrongKey"; // key is not part of the expected chord/note

interface TimingWindows {
  early: number; // seconds allowed early
  late: number; // seconds allowed late
}

export default class RhythmEngine {
  private notes: NoteEvent[];
  private nextIdx: number = 0; // first un-judged note index
  private early: number;
  private late: number;

  // Per-key index that points to the next relevant note for that key
  private pointerPerKey: Map<string, number> = new Map();
  private notesPerKey: Map<string, number[]> = new Map();

  constructor(notes: NoteEvent[], windows: TimingWindows = { early: 0.05, late: 0.4 }) {
    // Assume notes are supplied sorted by start time ASC
    this.notes = notes;
    this.early = windows.early;
    this.late = windows.late;

    // Build inverted index key -> array of note indices
    notes.forEach((n, idx) => {
      n.keys.forEach((k) => {
        if (!this.notesPerKey.has(k)) this.notesPerKey.set(k, []);
        this.notesPerKey.get(k)!.push(idx);
      });
    });
  }

  /** Process a key press at time t (seconds). Returns a judgement string. */
  handleKeyPress(key: string, t: number): Judgement {
    // 1. Mark notes too far in the past as misses
    while (this.nextIdx < this.notes.length && this.notes[this.nextIdx].start < t - this.late) {
      this.nextIdx++;
      // In a full implementation you would surface this miss to caller.
    }

    // 2. Find next candidate note for this key
    const list = this.notesPerKey.get(key);
    if (!list) return "wrongKey";

    // Advance per-key pointer past already judged indices
    const ptr = this.pointerPerKey.get(key) ?? 0;
    let p = ptr;
    while (p < list.length && list[p] < this.nextIdx) p++;
    if (p >= list.length) {
      this.pointerPerKey.set(key, p);
      return "wrongKey";
    }

    const idx = list[p];
    const note = this.notes[idx];
    const delta = t - note.start; // positive => late

    // Determine judgement based on timing accuracy
    const absDelta = Math.abs(delta);

    let judgement: Judgement;
    // Perfect only when note is on time or slightly late (not early)
    if (delta >= 0 && delta <= 0.2) judgement = "perfect";
    else if (absDelta <= 0.3) judgement = "great";
    else if (absDelta <= 0.4) judgement = "good";
    else if (delta >= -this.early && delta <= this.late) judgement = "hit";
    else judgement = "miss";

    // Consume note so it is not judged again
    this.pointerPerKey.set(key, p + 1);
    if (idx === this.nextIdx) this.nextIdx++;

    return judgement;
  }
} 