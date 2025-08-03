import { GAME_END_TIME } from "./constants";
import { NoteEvent, Judgement, TimingWindows } from "./types";

export default class RhythmEngine {
	private notes: NoteEvent[];
	private nextIdx: number = 0; // first un-judged note index
	private timingWindows: TimingWindows;

	// Per-key index that points to the next relevant note for that key
	private pointerPerKey: Map<string, number> = new Map();
	private notesPerKey: Map<string, number[]> = new Map();

	constructor(notes: NoteEvent[], windows: TimingWindows = { early: 0.05, late: 0.4 }) {
		// Assume notes are supplied sorted by start time ASC
		this.notes = notes;
		this.timingWindows = windows;

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
		while (this.nextIdx < this.notes.length && this.notes[this.nextIdx].start < t - this.timingWindows.late) {
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
		else if (delta >= -this.timingWindows.early && delta <= this.timingWindows.late) judgement = "hit";
		else judgement = "miss";

		// Consume note so it is not judged again
		this.pointerPerKey.set(key, p + 1);
		if (idx === this.nextIdx) this.nextIdx++;

		return judgement;
	}

	/**
	 * Check if the game is complete based on current time.
	 * Returns true if all notes have been processed and enough time has passed
	 * for any remaining notes to be considered missed.
	 * @param currentTime - The current time in the song/game
	 * @returns True if the game is complete, false otherwise
	 */
	isGameComplete(currentTime: number): boolean {
		if (this.notes.length === 0) return true;

		// Get the time of the last note
		const lastNote = this.notes[this.notes.length - 1];
		const gameEndTime = lastNote.start + GAME_END_TIME;

		return currentTime >= gameEndTime;
	}

	/**
	 * Get the completion progress as a percentage (0-100)
	 * @param currentTime - The current time in the song/game
	 * @returns The completion progress as a percentage (0-100)
	 */
	getProgress(currentTime: number): number {
		if (this.notes.length === 0) return 100;

		const lastNote = this.notes[this.notes.length - 1];
		const totalDuration = lastNote.start + GAME_END_TIME;

		return Math.min(100, (currentTime / totalDuration) * 100);
	}

	/**
	 * Get the time when the game should end (last note + timing window + buffer)
	 * @returns The time when the game should end
	 */
	getGameEndTime(): number {
		if (this.notes.length === 0) return 0;

		const lastNote = this.notes[this.notes.length - 1];
		return lastNote.start + GAME_END_TIME;
	}

	/**
	 * Check if we're close to the end of the game (useful for triggering end game logic early)
	 * @param currentTime - The current time in the song/game
	 * @param threshold - The threshold to check if we're close to the end of the game (default: 0.9)
	 * @returns True if we're close to the end of the game, false otherwise
	 */
	isNearEnd(currentTime: number, threshold: number = 0.9): boolean {
		return this.getProgress(currentTime) >= threshold * 100;
	}
}
