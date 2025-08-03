import { INotes } from "./interfaces";
import { interstellarThemeExported } from "../songs/interstellarThemeExported";

export interface Song {
	id: string;
	name: string;
	artist?: string;
	difficulty?: "Easy" | "Medium" | "Hard";
	notes: INotes[];
	audioUrl?: string; // URL or blob URL for the audio file
	audioDuration?: number; // Duration in seconds
}

export const PREDEFINED_SONGS: Song[] = [interstellarThemeExported];

const uploadedSongs: { [key: string]: Song } = {};

/**
 * Add a song to the uploaded songs storage
 * @param songData - The song data to add
 * @returns The ID of the added song
 */
export const addUploadedSong = (songData: Song): string => {
	const songId = `uploaded_${Date.now()}`;
	uploadedSongs[songId] = songData;
	return songId;
};

/**
 * Get all songs
 * @returns All songs available to play
 */
export const getAllSongs = (): { [key: string]: Song } => {
	return { ...PREDEFINED_SONGS.reduce((acc, song) => ({ ...acc, [song.id]: song }), {}), ...uploadedSongs };
};

/**
 * Import a song from a JSON string
 * @param jsonString - The JSON string to import
 * @returns The imported song
 */
export const importSongFromJSON = (jsonString: string): Song => {
	try {
		const songData = JSON.parse(jsonString);

		// Validate required fields
		if (!songData.name || !Array.isArray(songData.notes)) {
			throw new Error("Invalid song format: missing name or notes");
		}

		// Validate notes structure
		songData.notes.forEach(
			(
				note: { note?: string; offset?: number; type?: string; displayAftertimeSeconds?: number },
				index: number,
			) => {
				if (
					!note.note ||
					typeof note.offset !== "number" ||
					!note.type ||
					typeof note.displayAftertimeSeconds !== "number"
				) {
					throw new Error(`Invalid note format at index ${index}`);
				}
			},
		);

		// Handle audio data if present
		let audioUrl = songData.audioUrl;
		if (audioUrl && audioUrl.startsWith("data:")) {
			// If it's base64 data, convert it to a blob URL for better performance
			try {
				const response = fetch(audioUrl);
				response
					.then((res) => res.blob())
					.then((blob) => {
						audioUrl = URL.createObjectURL(blob);
					})
					.catch(() => {
						// Keep original data URL if conversion fails
					});
			} catch {
				// Keep original data URL if conversion fails
			}
		}

		return {
			id: `uploaded-${Date.now()}`,
			name: songData.name,
			artist: songData.artist || "Unknown Artist",
			difficulty: "Medium", // Default difficulty for uploaded songs
			notes: songData.notes,
			audioUrl: audioUrl,
			audioDuration: songData.audioDuration,
		};
	} catch (error) {
		throw new Error(`Failed to import song: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
};
