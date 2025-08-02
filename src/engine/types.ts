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
  
  export interface TimingWindows {
    early: number; // seconds allowed early
    late: number; // seconds allowed late
  }