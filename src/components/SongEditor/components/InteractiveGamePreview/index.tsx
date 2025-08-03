import { Card, CardContent, Paper, Typography } from "@mui/material";
import { InteractivePianoCanvas } from "../../../PianoCanvas";
import { useEffect } from "react";
import { useSongFileHandler } from "../../../../context/SongFileHandlerContext";
import { useSongEditor } from "../../../../context/SongEditorContext";
import { IFallingNote } from "../../../PianoCanvas/types";
import { notes } from "../../../../utils/constants";

const CANVAS_HEIGHT = 400;

export const InteractiveGamePreview = () => {
	const { currentTime, audioFile, duration } = useSongFileHandler();
	const {
		songData,
		selectedNotes,
		actions: { setSongData },
	} = useSongEditor();
	useEffect(() => {
		setSongData((prev) => ({
			...prev,
			audioFile,
			duration,
		}));
	}, [audioFile, duration]);

	// Convert editor notes to the format expected by the shared piano canvas
	const fallingNotes: IFallingNote[] = songData.notes
		.flatMap((n) =>
			n.keys.map((k) => {
				const data = notes[k as keyof typeof notes];
				if (!data) return null;
				return {
					note: k,
					offset: data.offset,
					type: data.type,
					time: n.time,
					duration: n.duration,
				} as IFallingNote;
			}),
		)
		.filter(Boolean) as IFallingNote[];

	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Interactive Game Preview - Click to Add Notes
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					This preview shows how notes will appear in the actual game.{" "}
					<strong>Click directly on piano keys to add notes</strong> at the current time, or use the Add
					button to place pre-selected notes. <strong>Drag notes up/down to change their timing</strong>, or{" "}
					<strong>drag the bottom edge to extend/shrink duration!</strong>
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
						width={800}
						height={CANVAS_HEIGHT}
						isEditorMode={true}
					/>
				</Paper>
			</CardContent>
		</Card>
	);
};
