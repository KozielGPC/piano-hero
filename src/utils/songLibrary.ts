import { INotes } from './interfaces';
import { generateScrollingNotes, musicJson } from './constants';

export interface Song {
  id: string;
  name: string;
  artist?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  notes: INotes[];
}

// Predefined songs
export const PREDEFINED_SONGS: Song[] = [
  {
    id: 'interstellar',
    name: 'Interstellar Theme',
    artist: 'Hans Zimmer',
    difficulty: 'Medium',
    notes: generateScrollingNotes(musicJson)
  },
  // Add more predefined songs here
];

// User uploaded songs storage
const uploadedSongs: { [key: string]: Song } = {};

export const addUploadedSong = (songData: Song): string => {
  const songId = `uploaded_${Date.now()}`;
  uploadedSongs[songId] = songData;
  return songId;
};

export const getUploadedSongs = (): { [key: string]: Song } => {
  return uploadedSongs;
};

export const getAllSongs = (): { [key: string]: Song } => {
  return { ...PREDEFINED_SONGS.reduce((acc, song) => ({ ...acc, [song.id]: song }), {}), ...uploadedSongs };
};

export const importSongFromJSON = (jsonString: string): Song => {
  try {
    const songData = JSON.parse(jsonString);
    
    // Validate required fields
    if (!songData.name || !Array.isArray(songData.notes)) {
      throw new Error('Invalid song format: missing name or notes');
    }

    // Validate notes structure
    songData.notes.forEach((note: { note?: string; offset?: number; type?: string; displayAftertimeSeconds?: number }, index: number) => {
      if (!note.note || typeof note.offset !== 'number' || !note.type || typeof note.displayAftertimeSeconds !== 'number') {
        throw new Error(`Invalid note format at index ${index}`);
      }
    });

    return {
      id: `uploaded-${Date.now()}`,
      name: songData.name,
      artist: songData.artist || 'Unknown Artist',
      difficulty: 'Medium', // Default difficulty for uploaded songs
      notes: songData.notes
    };
  } catch (error) {
    throw new Error(`Failed to import song: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get a song by its ID
 */
export const getSongById = (id: string): Song | undefined => {
  const allSongs = getAllSongs();
  return allSongs[id];
};

/**
 * Create a song object from uploaded MIDI data
 */
export const createSongFromMidi = (fileName: string, notes: INotes[]): Song => {
  const songName = fileName.replace(/\.(mid|midi)$/i, '');
  
  return {
    id: `uploaded-${Date.now()}`,
    name: songName,
    artist: 'Uploaded',
    difficulty: 'Medium', // Default difficulty for uploaded songs
    notes
  };
}; 