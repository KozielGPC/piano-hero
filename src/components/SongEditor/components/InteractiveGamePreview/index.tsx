import { Card, CardContent, Paper, Typography } from "@mui/material";
import { InteractivePianoCanvas } from "../../../PianoCanvas";
import { IFallingNote } from "../../../PianoCanvas/types";

const CANVAS_HEIGHT = 400;

interface InteractiveGamePreviewProps {
	fallingNotes: IFallingNote[];
	currentTime: number;
	selectedNotes: string[];
	addNote: () => void;
	onAddNoteAtKey?: (key: string, time: number) => void;
	onUpdateNoteTime?: (noteIndex: number, newTime: number) => void;
	onUpdateNoteDuration?: (noteIndex: number, newDuration: number) => void;
}
export const InteractiveGamePreview = ({
	fallingNotes,
	currentTime,
	selectedNotes,
	addNote,
	onAddNoteAtKey,
	onUpdateNoteTime,
	onUpdateNoteDuration,
}: InteractiveGamePreviewProps) => {
	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Interactive Game Preview - Click to Add Notes
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					This preview shows how notes will appear in the actual game. <strong>Click directly on piano keys to add notes</strong> at the current time, or use the Add button to place pre-selected notes. <strong>Drag notes up/down to change their timing</strong>, or <strong>drag the bottom edge to extend/shrink duration!</strong>
				</Typography>

				<Paper
					elevation={2}
					sx={{
						mb: 2,
						position: "relative",
						border: "1px solid #ddd",
						borderRadius: 1,
						overflow: "hidden",
					}}
				>
					<InteractivePianoCanvas
						notes={fallingNotes}
						currentTime={currentTime}
						selectedNotes={selectedNotes}
						onAddNote={() => addNote()}
						onAddNoteAtKey={onAddNoteAtKey}
						onUpdateNoteTime={onUpdateNoteTime}
						onUpdateNoteDuration={onUpdateNoteDuration}
						width={800}
						height={CANVAS_HEIGHT}
						isEditorMode={true}
					/>
				</Paper>
			</CardContent>
		</Card>
	);
};
