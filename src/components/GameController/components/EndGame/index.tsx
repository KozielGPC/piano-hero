import { Card, CardContent, Fade, Typography } from "@mui/material";
import { Stack } from "@mui/material";
import { Box } from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { Button } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { useGame } from "../../../../context/GameContext";
import { useNoteContext } from "../../../../context/NotesContext";

export const EndGame = () => {
    const { gameState, accuracy, maxCombo, actions } = useGame();
    const { score } = useNoteContext();

    return (
    <Fade in={gameState === "ENDED"} timeout={500}>
        <Card
            elevation={8}
            sx={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                maxWidth: 500,
                width: "100%",
            }}
        >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
                <EmojiEvents sx={{ fontSize: 48, color: "#ffd700", mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    Game Complete!
                </Typography>

                <Stack spacing={2} sx={{ my: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Final Score:</Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {score && typeof score === "object" ? score.correctNotes * 10 : 0}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>Accuracy:</Typography>
                        <Typography color="primary.main" fontWeight="bold">
                            {accuracy.toFixed(1)}%
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>Correct Notes:</Typography>
                        <Typography color="success.main" fontWeight="bold">
                            {score && typeof score === "object" ? score.correctNotes : 0}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>Wrong Notes:</Typography>
                        <Typography color="error.main" fontWeight="bold">
                            {score && typeof score === "object" ? score.wrongNotes : 0}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>Max Combo:</Typography>
                        <Typography color="primary.main" fontWeight="bold">
                            {maxCombo}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={actions.startGame}
                        sx={{
                            background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        }}
                    >
                        Play Again
                    </Button>
                    <Button variant="outlined" onClick={actions.returnToMenu}>
                        Main Menu
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    </Fade>
    );
};