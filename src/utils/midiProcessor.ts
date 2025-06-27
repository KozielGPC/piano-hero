import { MidiParserData, INotes } from './interfaces';
import { NoteType } from './constants';
// @ts-expect-error - midi-parser-js doesn't have TypeScript definitions
import MidiParser from 'midi-parser-js';

// MIDI note number to note name mapping
const MIDI_NOTE_NAMES: { [key: number]: string } = {
  60: 'C4',  // Middle C
  61: 'C#4',
  62: 'D4',
  63: 'D#4', 
  64: 'E4',
  65: 'F4',
  66: 'F#4',
  67: 'G4',
  68: 'G#4',
  69: 'A4',
  70: 'A#4',
  71: 'B4',
  72: 'C5',
  73: 'C#5',
  74: 'D5',
  75: 'D#5',
  76: 'E5',
  77: 'F5',
  78: 'F#5',
  79: 'G5',
  80: 'G#5',
  81: 'A5',
  82: 'A#5',
  83: 'B5'
};

// Piano keys mapping to supported notes
const SUPPORTED_NOTES = new Set([
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
]);

// Determine if a note is black or white key
const getKeyType = (noteName: string): NoteType => {
  return noteName.includes('#') ? NoteType.black : NoteType.white;
};

/**
 * Parse MIDI file and convert to game format
 */
export const processMidiFile = async (file: File): Promise<INotes[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Parse MIDI file
        const midiData: MidiParserData = MidiParser.parse(uint8Array);
        
        if (!midiData || !midiData.track || midiData.track.length === 0) {
          throw new Error('Invalid MIDI file or no tracks found');
        }

        // Extract notes from all tracks
        const notes: INotes[] = [];
        const ticksPerQuarter = midiData.timeDivision || 480;
        const microsecondsPerQuarter = 500000; // Default tempo (120 BPM)
        
        // Process all tracks
        midiData.track.forEach((track) => {
          let trackTime = 0;
          
          track.event.forEach((event) => {
            trackTime += event.deltaTime || 0;
            
            // Handle note on events
            if (event.type === 9 && event.data && event.data.length >= 2) { // Note On
              const noteNumber = event.data[0];
              const velocity = event.data[1];
              
              if (velocity > 0 && MIDI_NOTE_NAMES[noteNumber]) {
                const noteName = MIDI_NOTE_NAMES[noteNumber];
                
                if (SUPPORTED_NOTES.has(noteName)) {
                  // Convert MIDI ticks to seconds
                  const timeInSeconds = (trackTime / ticksPerQuarter) * (microsecondsPerQuarter / 1000000);
                  
                  notes.push({
                    note: noteName,
                    offset: Math.round(timeInSeconds * 100), // Convert to offset for game timing
                    type: getKeyType(noteName),
                    displayAftertimeSeconds: timeInSeconds
                  });
                }
              }
            }
          });
        });

        // Sort notes by display time
        notes.sort((a, b) => a.displayAftertimeSeconds - b.displayAftertimeSeconds);
        
        resolve(notes);
      } catch (error) {
        console.error('Error parsing MIDI file:', error);
        reject(new Error(`Failed to parse MIDI file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}; 