import interstellarThemeData from './Interestellar_Theme_song.json';
import { Song } from '../utils/songLibrary';
import { NoteType } from '../utils/constants';
import { INotes } from '../utils/interfaces';

export const interstellarThemeExported: Song = {
  id: 'interstellar-theme-exported',
  name: interstellarThemeData.name,
  artist: interstellarThemeData.artist || 'Hans Zimmer',
  difficulty: 'Medium' as const,
  notes: interstellarThemeData.notes.map((note): INotes => ({
    note: note.note,
    offset: note.offset,
    type: note.type as NoteType,
    displayAftertimeSeconds: note.displayAftertimeSeconds
  })),
  audioDuration: interstellarThemeData.audioDuration,
  audioUrl: interstellarThemeData.audioUrl,
}; 