import librosa
import numpy as np
import json
from pydub import AudioSegment

note_mapping = {
    48: "Q",   # C3
    49: "Qb",  # C#3
    50: "W",   # D3
    51: "Wb",  # D#3
    52: "E",   # E3
    53: "R",   # F3
    54: "Rb",  # F#3
    55: "T",   # G3
    56: "Tb",  # G#3
    57: "Y",   # A3
    58: "Ub",  # A#3
    59: "U",   # B3
    60: "Z",   # C4
    61: "S",   # C#4
    62: "X",   # D4
    63: "D",   # D#4
    64: "C",   # E4
    65: "V",   # F4
    66: "G",   # F#4
    67: "B",   # G4
    68: "H",   # G#4
    69: "N",   # A4
    70: "J",   # A#4
    71: "M",   # B4
}

notes = {
    "Qb": {
        "offset": -11,
        "note": "2",
        "type": "black",
        "fileName": "Db4.mp3"
    },
    "Q": {
        "offset": -12.5,
        "note": "q",
        "type": "white",
        "fileName": "C4.mp3"
    },
    "Wb": {
        "offset": -9,
        "note": "3",
        "type": "black",
        "fileName": "Eb4.mp3"
    },
    "W": {
        "offset": -10.5,
        "note": "w",
        "type": "white",
        "fileName": "D4.mp3"
    },
    "E": {
        "offset": -8.5,
        "note": "e",
        "type": "white",
        "fileName": "E4.mp3"
    },
    "Rb": {
        "offset": -5,
        "note": "4",
        "type": "black",
        "fileName": "Gb4.mp3"
    },
    "R": {
        "offset": -6.5,
        "note": "r",
        "type": "white",
        "fileName": "F4.mp3"
    },
    "Tb": {
        "offset": -3,
        "note": "5",
        "type": "black",
        "fileName": "Ab4.mp3"
    },
    "T": {
        "offset": -4.5,
        "note": "t",
        "type": "white",
        "fileName": "G4.mp3"
    },
    "Ub": {
        "offset": -1,
        "note": "6",
        "type": "black",
        "fileName": "Bb4.mp3"
    },
    "Y": {
        "offset": -2.5,
        "note": "y",
        "type": "white",
        "fileName": "A4.mp3"
    },
    "U": {
        "offset": -0.5,
        "note": "u",
        "type": "white",
        "fileName": "B4.mp3"
    },
    "S": {
        "offset": 3,
        "note": "s",
        "type": "black",
        "fileName": "Db5.mp3"
    },
    "Z": {
        "offset": 1.5,
        "note": "z",
        "type": "white",
        "fileName": "C5.mp3"
    },
    "D": {
        "offset": 5,
        "note": "d",
        "type": "black",
        "fileName": "Eb5.mp3"
    },
    "X": {
        "offset": 3.5,
        "note": "x",
        "type": "white",
        "fileName": "D5.mp3"
    },
    "C": {
        "offset": 5.5,
        "note": "c",
        "type": "white",
        "fileName": "E5.mp3"
    },
    "G": {
        "offset": 9,
        "note": "g",
        "type": "black",
        "fileName": "Gb5.mp3"
    },
    "V": {
        "offset": 7.5,
        "note": "v",
        "type": "white",
        "fileName": "F5.mp3"
    },
    "H": {
        "offset": 11,
        "note": "h",
        "type": "black",
        "fileName": "Ab5.mp3"
    },
    "B": {
        "offset": 9.5,
        "note": "b",
        "type": "white",
        "fileName": "G5.mp3"
    },
    "J": {
        "offset": 13,
        "note": "j",
        "type": "black",
        "fileName": "Bb5.mp3"
    },
    "N": {
        "offset": 11.5,
        "note": "n",
        "type": "white",
        "fileName": "A5.mp3"
    },
    "M": {
        "offset": 13.5,
        "note": "m",
        "type": "white",
        "fileName": "B5.mp3"
    }
}


def convert_mp3_to_wav(mp3_file):
    audio = AudioSegment.from_mp3(mp3_file)
    wav_file = mp3_file.replace(".mp3", ".wav")
    audio.export(wav_file, format="wav")
    return wav_file

def analyze_audio(file_path):
    wav_file = convert_mp3_to_wav(file_path)

    # Load audio and extract features
    y, sr = librosa.load(wav_file)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time')

    notes_sequence = []
    for onset in onsets:
        # Convert onset time to the corresponding chroma frame index
        time_index = librosa.time_to_frames(onset, sr=sr, hop_length=512)
        
        if time_index < chroma.shape[1]:  # Ensure the index is within bounds
            max_note_idx = np.argmax(chroma[:, time_index])
            midi_note = max_note_idx + 48  # Adjust base MIDI note as per your range
            
            if midi_note in note_mapping:
                note_name = note_mapping[midi_note]
                
                # Assume a predefined `notes` dictionary exists with details for each note
                note_data = notes[note_name]
                
                note_info = {
                    "note": note_data['note'],
                    "offset": note_data['offset'],
                    "type": note_data['type'],
                    "note_name": note_name,
                    "displayAftertimeSeconds": onset
                }
                notes_sequence.append(note_info)

    # Save the notes sequence as JSON
    with open("notes_sequence.json", "w") as file:
        json.dump(notes_sequence, file, indent=2)

    return notes_sequence

# Example Usage
file_path = "media/interestellar.mp3"
notes_sequence = analyze_audio(file_path)
print("Notes sequence generated!!!")
