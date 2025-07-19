import { Add } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, Stack, Chip, Grid, TextField, Button } from "@mui/material";
import { notes } from "../../../../utils/constants";

interface NoteSelectionProps {
	selectedNotes: string[];
	setSelectedNotes: React.Dispatch<React.SetStateAction<string[]>>;
	noteDuration: number;
	setNoteDuration: React.Dispatch<React.SetStateAction<number>>;
	addNote: () => void;
}

export const NoteSelection = ({
	selectedNotes,
	setSelectedNotes,
	noteDuration,
	setNoteDuration,
	addNote,
}: NoteSelectionProps) => {
	const noteOptions = Object.entries(notes).map(([key, noteData]) => ({
		key,
		label: `${key} (${noteData.note})`,
	}));

	return (
		<Card elevation={3} sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Note Selection
				</Typography>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						Select notes to add (you can select multiple):
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
						{noteOptions.map((noteOption) => (
							<Chip
								key={noteOption.key}
								label={noteOption.label}
								onClick={() => {
									setSelectedNotes((prev) =>
										prev.includes(noteOption.key)
											? prev.filter((n) => n !== noteOption.key)
											: [...prev, noteOption.key],
									);
								}}
								color={selectedNotes.includes(noteOption.key) ? "primary" : "default"}
								variant={selectedNotes.includes(noteOption.key) ? "filled" : "outlined"}
							/>
						))}
					</Stack>
				</Box>

				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} sm={6} md={4}>
						<TextField
							fullWidth
							type="number"
							label="Note Duration (seconds)"
							value={noteDuration}
							onChange={(e) => setNoteDuration(Math.max(0.1, parseFloat(e.target.value) || 1))}
							inputProps={{ min: 0.1, step: 0.1 }}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={() => addNote()}
							disabled={selectedNotes.length === 0}
							fullWidth
						>
							Add Note at Current Time
						</Button>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};
