"""
Guitar Hero and Clone Hero Note Chart Format Parser
This demonstrates the common approaches used by GH-like games for note sequences
"""

import json
import mido
from typing import List, Dict, Union
import re
from dataclasses import dataclass
from enum import Enum

# Common section types in .chart files
class ChartSection(Enum):
    SONG = "Song"
    SYNC_TRACK = "SyncTrack"
    EVENTS = "Events"
    EXPERT = "ExpertSingle"
    HARD = "HardSingle"
    MEDIUM = "MediumSingle"
    EASY = "EasySingle"

@dataclass
class ChartNote:
    time: int        # Timestamp in milliseconds
    note: int        # Note number (0-4 for guitar)
    duration: int    # Duration in milliseconds
    
@dataclass
class ChartEvent:
    time: int
    event_type: str
    value: Union[str, int, float]

class ChartParser:
    """
    Parser for .chart files (used by Clone Hero and later Guitar Hero games)
    """
    def __init__(self):
        self.resolution = 192  # Default resolution (ticks per quarter note)
        self.bpm = 120.0      # Default BPM
        
    def parse_chart_file(self, filepath: str) -> Dict:
        """Parse a .chart file and extract note data"""
        sections = {}
        current_section = None
        
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                
                # Section header
                if line.startswith('['):
                    current_section = line[1:-1]
                    sections[current_section] = []
                    continue
                
                # Section data
                if current_section and '=' in line:
                    key, value = line.split('=', 1)
                    sections[current_section].append((key.strip(), value.strip()))
        
        return self._process_sections(sections)
    
    def _process_sections(self, sections: Dict) -> Dict:
        """Process parsed sections into structured data"""
        result = {
            'metadata': {},
            'notes': [],
            'sync': [],
            'events': []
        }
        
        # Process song metadata
        if 'Song' in sections:
            for key, value in sections['Song']:
                result['metadata'][key] = value
        
        # Process note tracks (focusing on Expert difficulty as example)
        if 'ExpertSingle' in sections:
            for time, event in sections['ExpertSingle']:
                note_data = self._parse_note_event(time, event)
                if note_data:
                    result['notes'].append(note_data)
        
        return result
    
    def _parse_note_event(self, time: str, event: str) -> ChartNote:
        """Parse a note event line from the chart file"""
        # Example format: N 4 192 (note 4 at tick 192)
        match = re.match(r'N (\d+) (\d+)', event)
        if match:
            note, duration = map(int, match.groups())
            return ChartNote(
                time=int(time),
                note=note,
                duration=duration
            )
        return None

class MidiChartConverter:
    """
    Converter for MIDI files to Guitar Hero compatible note charts
    This is similar to how Guitar Flash handles MIDI conversion
    """
    def __init__(self):
        self.ticks_per_beat = 480  # Standard MIDI resolution
        
    def convert_midi_to_chart(self, midi_file: str) -> List[ChartNote]:
        """Convert MIDI file to Guitar Hero style note chart"""
        midi = mido.MidiFile(midi_file)
        notes = []
        current_time = 0
        
        # Track active notes and their start times
        active_notes = {}
        
        for msg in midi.tracks[0]:  # Usually melody track
            current_time += msg.time
            
            if msg.type == 'note_on' and msg.velocity > 0:
                # Note start
                active_notes[msg.note] = current_time
            
            elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                # Note end
                if msg.note in active_notes:
                    start_time = active_notes[msg.note]
                    duration = current_time - start_time
                    
                    # Convert MIDI note to guitar fret (simplified mapping)
                    fret = self._midi_note_to_fret(msg.note)
                    
                    if fret is not None:
                        notes.append(ChartNote(
                            time=int(start_time),
                            note=fret,
                            duration=int(duration)
                        ))
                    
                    del active_notes[msg.note]
        
        return notes
    
    def _midi_note_to_fret(self, midi_note: int) -> int:
        """
        Convert MIDI note to guitar fret number
        This is a simplified example - actual games use more complex mapping
        """
        # Map MIDI notes to 5 frets (0-4)
        note_range = range(60, 65)  # C4 to E4
        if midi_note in note_range:
            return midi_note - 60
        return None

def convert_to_piano_hero_format(chart_notes: List[ChartNote]) -> List[Dict]:
    """
    Convert Guitar Hero style notes to Piano Hero format
    """
    piano_notes = []
    
    # Note mapping for Piano Hero (simplified)
    NOTE_MAPPING = {
        0: {"note": "q", "offset": -12.5, "type": "white"},  # C
        1: {"note": "w", "offset": -10.5, "type": "white"},  # D
        2: {"note": "e", "offset": -8.5, "type": "white"},   # E
        3: {"note": "r", "offset": -6.5, "type": "white"},   # F
        4: {"note": "t", "offset": -4.5, "type": "white"},   # G
    }
    
    for note in chart_notes:
        if note.note in NOTE_MAPPING:
            note_data = NOTE_MAPPING[note.note].copy()
            note_data["displayAftertimeSeconds"] = note.time / 1000.0  # Convert to seconds
            piano_notes.append(note_data)
    
    return piano_notes

def main():
    # Example usage
    chart_parser = ChartParser()
    midi_converter = MidiChartConverter()
    
    # # Example 1: Parse .chart file
    # chart_data = chart_parser.parse_chart_file("example.chart")
    
    # Example 2: Convert MIDI to chart
    chart_notes = midi_converter.convert_midi_to_chart("media/interestellar.mid")
    
    # Convert to Piano Hero format
    piano_notes = convert_to_piano_hero_format(chart_notes)
    
    # Save to JSON
    with open("notes.json", "w") as f:
        json.dump(piano_notes, f, indent=2)

if __name__ == "__main__":
    main()