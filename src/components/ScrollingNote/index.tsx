import { Box } from "@mui/material";
import { NoteType } from "../../utils/constants";
import { useEffect, useRef, useState } from "react";
import { useNoteContext } from "../../context/NotesContext";
import { INotes } from "../../utils/interfaces";

interface IProps {
	note: INotes;
}

export const ScrollingNote = ({ note }: IProps) => {
	const [isVisible, setIsVisible] = useState(false);

	const { addNote, removeNote, targetDivRef } = useNoteContext();

	const movingDivRef = useRef<HTMLDivElement | null>(null);

	const [hasCollided, setHasCollided] = useState(false);

	useEffect(() => {
		if (hasCollided) {
			addNote({ note: note.note, leftOffset: note.offset });
		} else {
			removeNote(note.note);
		}
	}, [hasCollided]);

	useEffect(() => {
		if (isVisible) {
			const movingDiv = movingDivRef!.current;
			const targetDiv = targetDivRef!.current;
			let animationFrameId: number;

			const checkCollision = () => {
				const movingDivRect = movingDiv!.getBoundingClientRect();
				const targetDivRect = targetDiv!.getBoundingClientRect();

				if (
					movingDivRect.x < targetDivRect.x + targetDivRect.width &&
					movingDivRect.x + movingDivRect.width > targetDivRect.x &&
					movingDivRect.y < targetDivRect.y + targetDivRect.height &&
					movingDivRect.y + movingDivRect.height > targetDivRect.y
				) {
					setHasCollided(true);
				} else {
					setHasCollided(false);
				}
			};

			const animate = () => {
				const startTime = performance.now();

				const step = (timestamp: number) => {
					const progress = Math.min((timestamp - startTime) / 5000, 1);
					movingDiv!.style.transform = `translateY(${
						progress * (window.innerHeight - 100)
					}px)`;

					checkCollision();

					if (progress < 1) {
						animationFrameId = requestAnimationFrame(step);
					}
				};

				animationFrameId = requestAnimationFrame(step);
			};

			animate();

			return () => {
				cancelAnimationFrame(animationFrameId);
			};
		}
	}, [isVisible]);

	useEffect(() => {
		const renderComponent = () => {
			setIsVisible(true);
		};

		const timeoutDisplay = setTimeout(
			renderComponent,
			note.displayAftertimeSeconds * 1000
		);

		const hideComponent = () => {
			setIsVisible(false);
		};

		const timeoutHide = setTimeout(() => {
			removeNote(note.note);
			hideComponent();
		}, (note.displayAftertimeSeconds + 2.8) * 1000);

		return () => {
			clearTimeout(timeoutDisplay);
			clearTimeout(timeoutHide);
		};
	}, []);

	const isWhite = note.type === NoteType.white;

	const keyStyles = isWhite
		? {
				position: "absolute",
				width: "60px",
				height: "50px",
				backgroundColor: "white",
				color: "black",
				border: "1px solid black",
				margin: "2px",
				marginLeft: `${note.offset * 32}px`,
		  }
		: {
				width: "40px",
				height: "50px",
				backgroundColor: "black",
				color: "white",
				border: "1px solid black",
				margin: "2px",
				marginLeft: `${note.offset * 20}px`,
				zIndex: "1",
		  };

	if (!isVisible) {
		return null;
	}
	return (
		<Box
			sx={{
				...keyStyles,
				position: "absolute",
				boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
				display: "flex",
				justifyContent: "center",
			}}
			ref={movingDivRef}
		>
			{note.note}
		</Box>
	);
};
