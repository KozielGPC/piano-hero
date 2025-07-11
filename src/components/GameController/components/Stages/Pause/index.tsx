import { Card, CardContent, Fade, Typography } from "@mui/material";
import { Stack } from "@mui/material";
import { Button } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { useGame } from "../../../../../context/GameContext";
import { Pause as PauseIcon } from "@mui/icons-material";
import { Stop } from "@mui/icons-material";

export const Pause = () => {
    const { gameState, actions } = useGame();
    return (
    <Fade in={gameState === "PAUSED"} timeout={300}>
        <Card
            elevation={8}
            sx={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                maxWidth: 400,
                width: "100%",
            }}
        >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
                <PauseIcon sx={{ fontSize: 48, color: "#ffa726", mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Game Paused
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Take a break and resume when ready
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={actions.resumeGame}
                        sx={{
                            background: "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)",
                        }}
                    >
                        Resume
                    </Button>
                    <Button variant="outlined" startIcon={<Stop />} onClick={actions.stopGame}>
                        End Game
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    </Fade>
    );
};