import { MidiParserData, INotes } from './interfaces';
import { notes } from './constants';
// @ts-expect-error - midi-parser-js doesn't have TypeScript definitions
import MidiParser from 'midi-parser-js';

// MIDI note number to game note mapping (same as in constants.ts)
const noteMapping: { [key: number]: typeof notes.Q } = {
  48: notes.Q,   // C3
  49: notes.Qb,  // C#3
  50: notes.W,   // D3
  51: notes.Wb,  // D#3
  52: notes.E,   // E3
  53: notes.R,   // F3
  54: notes.Rb,  // F#3
  55: notes.T,   // G3
  56: notes.Tb,  // G#3
  57: notes.Y,   // A3
  58: notes.Ub,  // A#3
  59: notes.U,   // B3
  60: notes.Z,   // C4 (Middle C)
  61: notes.S,   // C#4
  62: notes.X,   // D4
  63: notes.D,   // D#4
  64: notes.C,   // E4
  65: notes.V,   // F4
  66: notes.G,   // F#4
  67: notes.B,   // G4
  68: notes.H,   // G#4
  69: notes.N,   // A4
  70: notes.J,   // A#4
  71: notes.M,   // B4
  72: notes.Z,   // C5 (map to same as C4 for now)
  73: notes.S,   // C#5
  74: notes.X,   // D5
  75: notes.D,   // D#5
  76: notes.C,   // E5
  77: notes.V,   // F5
  78: notes.G,   // F#5
  79: notes.B,   // G5
  80: notes.H,   // G#5
  81: notes.N,   // A5
  82: notes.J,   // A#5
  83: notes.M,   // B5
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
        const gameNotes: INotes[] = [];
        const ticksPerQuarter = midiData.timeDivision || 480;
        const microsecondsPerQuarter = 500000; // Default tempo (120 BPM)
        
        // Process all tracks
        midiData.track.forEach((track) => {
          let trackTime = 0;
          let currentTempo = microsecondsPerQuarter;
          
          track.event.forEach((event) => {
            trackTime += event.deltaTime || 0;
            
            // Handle tempo changes
            if (event.type === 255 && event.data && event.data[0] === 81) { // Set Tempo meta event
              if (event.data.length >= 4) {
                currentTempo = (event.data[1] << 16) | (event.data[2] << 8) | event.data[3];
              }
            }
            
            // Handle note on events
            if (event.type === 9 && event.data && event.data.length >= 2) { // Note On
              const noteNumber = event.data[0];
              const velocity = event.data[1];
              
              if (velocity > 0 && noteMapping[noteNumber]) {
                const mappedNote = noteMapping[noteNumber];
                
                // Convert MIDI ticks to seconds
                const timeInSeconds = (trackTime / ticksPerQuarter) * (currentTempo / 1000000);
                
                gameNotes.push({
                  note: mappedNote.note,
                  offset: mappedNote.offset,
                  type: mappedNote.type,
                  displayAftertimeSeconds: timeInSeconds
                });
              }
            }
          });
        });

        // Sort notes by display time
        gameNotes.sort((a, b) => a.displayAftertimeSeconds - b.displayAftertimeSeconds);
        
        // Debug log to see how many notes were processed
        console.log(`Processed MIDI file: ${gameNotes.length} notes found`);
        console.log('First few notes:', gameNotes.slice(0, 5));
        
        resolve(gameNotes);
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