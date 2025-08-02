import RhythmEngine from "../../engine/RhythmEngine";
import { notes, NoteType } from "../../utils/constants";
import {
	OFFSET_UNIT,
	PIANO_HEIGHT,
	WHITE_KEY_WIDTH,
	BLACK_KEY_WIDTH,
	LOOKAHEAD_TIME,
	JUDGEMENT_INFO,
	KEY_HIGHLIGHT_MS,
	BLACK_KEY_HEIGHT_RATIO,
	NOTE_AREA_TOP_PADDING,
	NOTE_AREA_BOTTOM_PADDING,
	MINIMUM_NOTE_HEIGHT,
	NOTE_HEIGHT_MULTIPLIER,
	FEEDBACK_LABEL_OFFSET,
	BLACK_KEY_LABEL_OFFSET,
	WHITE_KEY_LABEL_OFFSET,
	WHITE_KEY_FONT,
	BLACK_KEY_FONT,
	KEY_STROKE_COLOR,
	KEY_STROKE_WIDTH,
	FEEDBACK_LABEL_FONT,
	CANVAS_BACKGROUND_COLOR,
	PIANO_STRIP_COLOR,
	WHITE_KEY_COLOR,
	BLACK_KEY_COLOR,
	NOTE_STROKE_WIDTH,
} from "./constants";
import { ActiveKeys, IFallingNote } from "./types";

/**
 * Calculates the center X position of a piano key based on its offset from the center
 * @param offset - The offset value of the key from the center position
 * @param canvasCenterX - The center X coordinate of the canvas
 * @returns The calculated center X position for the key
 */
export const getKeyCenterX = (offset: number, canvasCenterX: number) => {
	return canvasCenterX + offset * OFFSET_UNIT;
};

/**
 * Draws all piano keys (white and black) on the canvas with current active states
 * @param ctx - The 2D rendering context of the canvas
 * @param canvasWidth - The width of the canvas
 * @param activeKeys - Map containing currently active/highlighted keys with their states
 * @param height - The total height of the canvas
 */
export const drawPianoKeys = (
	ctx: CanvasRenderingContext2D,
	canvasWidth: number,
	activeKeys: ActiveKeys,
	height: number,
) => {
	const pianoStripY = height - PIANO_HEIGHT;
	const whiteKeyLabelY = height - WHITE_KEY_LABEL_OFFSET;
	const blackKeyLabelY = pianoStripY + BLACK_KEY_LABEL_OFFSET;

	// Draw white keys first
	Object.entries(notes).forEach(([keyLabel, noteInfo]) => {
		const noteData = noteInfo as (typeof notes)[keyof typeof notes];
		if (noteData.type !== NoteType.white) return;

		const keyCenterX = getKeyCenterX(noteData.offset, canvasWidth / 2);
		const keyState = activeKeys.get(keyLabel);
		const isKeyActive = keyState && keyState.expiry > performance.now();

		ctx.fillStyle = isKeyActive ? keyState!.color : WHITE_KEY_COLOR;
		ctx.strokeStyle = KEY_STROKE_COLOR;
		ctx.lineWidth = KEY_STROKE_WIDTH;
		ctx.fillRect(keyCenterX - WHITE_KEY_WIDTH / 2, pianoStripY, WHITE_KEY_WIDTH, PIANO_HEIGHT);
		ctx.strokeRect(keyCenterX - WHITE_KEY_WIDTH / 2, pianoStripY, WHITE_KEY_WIDTH, PIANO_HEIGHT);

		ctx.fillStyle = BLACK_KEY_COLOR;
		ctx.font = WHITE_KEY_FONT;
		ctx.textAlign = "center";
		ctx.fillText(keyLabel, keyCenterX, whiteKeyLabelY);
	});

	// Then draw black keys on top
	Object.entries(notes).forEach(([keyLabel, noteInfo]) => {
		const noteData = noteInfo as (typeof notes)[keyof typeof notes];
		if (noteData.type !== NoteType.black) return;

		const keyCenterX = getKeyCenterX(noteData.offset, canvasWidth / 2);
		const keyState = activeKeys.get(keyLabel);
		const isKeyActive = keyState && keyState.expiry > performance.now();
		const blackKeyHeight = PIANO_HEIGHT * BLACK_KEY_HEIGHT_RATIO;

		ctx.fillStyle = isKeyActive ? keyState!.color : BLACK_KEY_COLOR;
		ctx.fillRect(keyCenterX - BLACK_KEY_WIDTH / 2, pianoStripY, BLACK_KEY_WIDTH, blackKeyHeight);

		ctx.fillStyle = WHITE_KEY_COLOR;
		ctx.font = BLACK_KEY_FONT;
		ctx.textAlign = "center";
		ctx.fillText(keyLabel, keyCenterX, blackKeyLabelY);
	});
};

/**
 * Main function to draw the entire canvas including falling notes and piano keys
 * @param canvas - The HTML canvas element to draw on (can be null)
 * @param songNotes - Array of falling notes to render
 * @param currentTime - Current time in the song/game
 * @param height - The total height of the canvas
 * @param activeKeys - Map containing currently active/highlighted keys with their states
 */
export const drawCanvas = (
	canvas: HTMLCanvasElement | null,
	songNotes: IFallingNote[],
	currentTime: number,
	height: number,
	activeKeys: ActiveKeys,
) => {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;
	const noteAreaHeight = height - PIANO_HEIGHT;
	const pianoStripY = height - PIANO_HEIGHT;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// Draw background areas
	ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
	ctx.fillRect(0, 0, canvasWidth, noteAreaHeight);
	ctx.fillStyle = PIANO_STRIP_COLOR;
	ctx.fillRect(0, pianoStripY, canvasWidth, PIANO_HEIGHT);

	const drawFeedbackLabel = (note: IFallingNote, keyCenterX: number) => {
		const keyState = activeKeys.get(note.note);
		if (keyState && keyState.expiry > performance.now()) {
			ctx.fillStyle = keyState.color;
			ctx.font = FEEDBACK_LABEL_FONT;
			ctx.textAlign = "center";
			const feedbackLabelY = pianoStripY - FEEDBACK_LABEL_OFFSET;
			ctx.fillText(keyState.label, keyCenterX, feedbackLabelY);
		}
	};

	// Draw falling notes
	songNotes.forEach((note) => {
		const noteStartTime = note.time;
		const noteEndTime = note.time + (note.duration || 1);
		const noteIsVisible = currentTime >= noteStartTime - LOOKAHEAD_TIME && currentTime <= noteEndTime + 1;

		if (!noteIsVisible) return;

		const timeUntilNote = noteStartTime - currentTime;
		const fallProgress = (LOOKAHEAD_TIME - timeUntilNote) / LOOKAHEAD_TIME;
		const fallAreaHeight = noteAreaHeight - NOTE_AREA_BOTTOM_PADDING;
		const noteCenterY = fallProgress * fallAreaHeight + NOTE_AREA_TOP_PADDING;
		const noteIsInViewport = noteCenterY >= -NOTE_AREA_BOTTOM_PADDING && noteCenterY <= height;

		if (!noteIsInViewport) return;

		const noteData = notes[note.note as keyof typeof notes];
		if (!noteData) return;

		const noteCenterX = getKeyCenterX(noteData.offset, canvasWidth / 2);
		const noteWidth = noteData.type === NoteType.black ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;
		const noteColor = noteData.type === NoteType.black ? BLACK_KEY_COLOR : WHITE_KEY_COLOR;
		const noteDuration = note.duration || 1;
		const noteHeight = Math.max(MINIMUM_NOTE_HEIGHT, noteDuration * NOTE_HEIGHT_MULTIPLIER);

		ctx.fillStyle = noteColor;
		ctx.strokeStyle = KEY_STROKE_COLOR;
		ctx.lineWidth = NOTE_STROKE_WIDTH;

		ctx.fillRect(noteCenterX - noteWidth / 2, noteCenterY, noteWidth, noteHeight);
		ctx.strokeRect(noteCenterX - noteWidth / 2, noteCenterY, noteWidth, noteHeight);

		drawFeedbackLabel(note, noteCenterX);
	});

	drawPianoKeys(ctx, canvasWidth, activeKeys, height);
};

/**
 * Redraws only the piano strip section of the canvas (used for key-flash updates)
 * Avoids touching the falling-note area for better performance
 * @param canvas - The HTML canvas element to draw on (can be null)
 * @param activeKeys - Map containing currently active/highlighted keys with their states
 * @param height - The total height of the canvas
 */
export const redrawPianoStrip = (canvas: HTMLCanvasElement | null, activeKeys: ActiveKeys, height: number) => {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;
	const pianoStripY = canvasHeight - PIANO_HEIGHT;

	// Clear only the piano region
	ctx.clearRect(0, pianoStripY, canvasWidth, PIANO_HEIGHT);
	// Repaint background strip
	ctx.fillStyle = PIANO_STRIP_COLOR;
	ctx.fillRect(0, pianoStripY, canvasWidth, PIANO_HEIGHT);
	// Draw keys (with current highlight state)
	drawPianoKeys(ctx, canvasWidth, activeKeys, height);
};

/**
 * Evaluates a key press and plays piano audio only for wrong notes
 * @param keyLabel - The label/name of the key that was pressed
 * @param engine - The rhythm engine instance for game logic (can be null)
 * @param currentTime - Current time in the song/game
 * @param activeKeys - Map to store active key states for visual feedback
 * @param incrementWrong - Callback function to increment wrong hit counter
 * @param incrementCorrect - Callback function to increment correct hit counter
 * @param addPoints - Callback function to add points to the score
 * @param audioCache - React ref containing cached audio elements for better performance
 * @param hasBackgroundAudio - Whether background song audio is playing (affects when to play piano sounds)
 */
export const playNoteAudio = (
	keyLabel: string,
	engine: RhythmEngine | null,
	currentTime: number,
	activeKeys: ActiveKeys,
	incrementWrong: () => void,
	incrementCorrect: () => void,
	addPoints: (points: number) => void,
	audioCache: React.MutableRefObject<Map<string, HTMLAudioElement>>,
	hasBackgroundAudio: boolean = false,
) => {
	const noteData = notes[keyLabel as keyof typeof notes];
	if (!noteData) return;

	// First evaluate the hit to determine if it was correct or wrong
	const hitJudgement = engine ? engine.handleKeyPress(keyLabel, currentTime) : "miss";
	const isIncorrectHit = hitJudgement === "miss" || hitJudgement === "wrongKey";

	// Update score based on hit judgement
	if (isIncorrectHit) {
		incrementWrong();
	} else {
		incrementCorrect();
	}

	const judgementInfo = JUDGEMENT_INFO[hitJudgement];
	const hasPointsToAdd = judgementInfo.points > 0;

	if (hasPointsToAdd) {
		addPoints(judgementInfo.points);
	}

	// When background audio is playing, only play piano sounds for wrong notes
	// When no background audio, always play piano sounds (classic mode)
	const shouldPlayPianoSound = !hasBackgroundAudio || isIncorrectHit;

	if (shouldPlayPianoSound) {
		let audioElement = audioCache.current.get(keyLabel);
		if (!audioElement) {
			audioElement = new Audio(`/sounds/${noteData.fileName}`);
			audioElement.volume = hasBackgroundAudio ? 0.6 : 1.0; // Lower volume when background audio is playing
			audioCache.current.set(keyLabel, audioElement);
		}

		// Prevent overlapping sounds by stopping current playback before starting new one
		if (!audioElement.paused) {
			audioElement.pause();
		}
		audioElement.currentTime = 0;
		audioElement.play().catch(() => {});
	}

	// Show visual feedback for the hit judgement (single update to avoid conflicts)
	activeKeys.set(keyLabel, {
		expiry: performance.now() + KEY_HIGHLIGHT_MS,
		color: judgementInfo.color,
		label: judgementInfo.text,
	});
};

/**
 * Converts a Y position to a time value
 * Used for dragging notes in editor mode
 * @param y - The Y position to convert
 * @param height - The height of the canvas
 * @param currentTime - The current time in the song/game
 * @returns The time value corresponding to the Y position
 */
export const getTimeFromY = (y: number, height: number, currentTime: number): number => {
	const noteAreaHeight = height - PIANO_HEIGHT;
	const fallAreaHeight = noteAreaHeight - NOTE_AREA_BOTTOM_PADDING;
	const fallProgress = (y - NOTE_AREA_TOP_PADDING) / fallAreaHeight;
	const timeUntilNote = LOOKAHEAD_TIME - fallProgress * LOOKAHEAD_TIME;
	return currentTime + timeUntilNote;
};

/**
 * Finds the note at a given position on the canvas
 * @param x - The X position to check
 * @param y - The Y position to check
 * @param songNotes - The array of falling notes
 * @param currentTime - The current time in the song/game
 * @param height - The height of the canvas
 * @param width - The width of the canvas
 * @returns The note at the position, or null if no note is found
 */
export const findNoteAtPosition = (
	x: number,
	y: number,
	songNotes: IFallingNote[],
	currentTime: number,
	height: number,
	width: number,
): { noteIndex: number; area: "bottom" | "center" } | null => {
	const noteAreaHeight = height - PIANO_HEIGHT;

	// Check if click is in the falling notes area
	if (y >= noteAreaHeight) return null;

	for (let i = 0; i < songNotes.length; i++) {
		const note = songNotes[i];
		const noteStartTime = note.time;
		const noteEndTime = note.time + (note.duration || 1);
		const noteIsVisible = currentTime >= noteStartTime - LOOKAHEAD_TIME && currentTime <= noteEndTime + 1;

		if (!noteIsVisible) continue;

		const timeUntilNote = noteStartTime - currentTime;
		const fallProgress = (LOOKAHEAD_TIME - timeUntilNote) / LOOKAHEAD_TIME;
		const fallAreaHeight = noteAreaHeight - NOTE_AREA_BOTTOM_PADDING;
		const noteCenterY = fallProgress * fallAreaHeight + NOTE_AREA_TOP_PADDING;
		const noteHeight = Math.max(MINIMUM_NOTE_HEIGHT, (note.duration || 1) * NOTE_HEIGHT_MULTIPLIER);

		const noteData = notes[note.note as keyof typeof notes];
		if (!noteData) continue;

		const noteCenterX = getKeyCenterX(noteData.offset, width / 2);
		const noteWidth = noteData.type === NoteType.black ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;

		const noteLeft = noteCenterX - noteWidth / 2;
		const noteRight = noteCenterX + noteWidth / 2;
		const noteTop = noteCenterY;
		const noteBottom = noteCenterY + noteHeight;

		// Check if click is within note bounds
		if (x >= noteLeft && x <= noteRight && y >= noteTop && y <= noteBottom) {
			const resizeHandleSize = 8; // 8px resize handle area

			// Determine which area was clicked (only bottom edge and center)
			if (y >= noteBottom - resizeHandleSize) {
				return { noteIndex: i, area: "bottom" };
			} else {
				return { noteIndex: i, area: "center" };
			}
		}
	}
	return null;
};