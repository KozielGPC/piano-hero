export interface NoteEvent {
    id: string;
    keys: string[]; // keys involved (single note => 1 element, chord => many)
    start: number; // seconds when the note should be hit
    end?: number; // for future hold-note support
  }
  
  export type Judgement =
    | "perfect"
    | "great"
    | "good"
    | "hit"
    | "miss"
    | "wrongKey";
  
  export interface TimingWindows {
    early: number; // seconds allowed early
    late: number; // seconds allowed late
  }