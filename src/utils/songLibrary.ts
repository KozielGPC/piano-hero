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

/**
 * Get all available songs (predefined + uploaded)
 */
export const getAllSongs = (uploadedSongs: Song[] = []): Song[] => {
  return [...PREDEFINED_SONGS, ...uploadedSongs];
};

/**
 * Find a song by ID
 */
export const getSongById = (id: string, uploadedSongs: Song[] = []): Song | undefined => {
  const allSongs = getAllSongs(uploadedSongs);
  return allSongs.find(song => song.id === id);
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