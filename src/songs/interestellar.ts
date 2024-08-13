import { notes } from "../utils/constants";
import { INotes } from "../utils/interfaces";

export const scrollingNotes: INotes[] = [
	{
		...notes.Y,
		displayAftertimeSeconds: 0,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 2,
	},
	{
		...notes.Y,
		displayAftertimeSeconds: 4,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 4.7,
	},
	{
		...notes.Z,
		displayAftertimeSeconds: 5.4,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 6.1,
	},
	{
		...notes.Y,
		displayAftertimeSeconds: 6.8,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 7.5,
	},
	{
		...notes.Z,
		displayAftertimeSeconds: 8.2,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 10.2,
	},
	{
		...notes.Y,
		displayAftertimeSeconds: 12.2,
	},
	{
		...notes.C,
		// displayAftertimeSeconds: 0.5,
		displayAftertimeSeconds: 12.7,
	},
	{
		...notes.Y,
		// displayAftertimeSeconds: 2.3,
		displayAftertimeSeconds: 14.5,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 15,
	},

	{
		...notes.U,
		displayAftertimeSeconds: 16.2,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 16.7,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 18.5,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 19,
	},
	{
		...notes.Z,
		displayAftertimeSeconds: 20.5,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 21.2,
	},
	{
		...notes.Z,
		displayAftertimeSeconds: 22.5,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 23,
	},
	{
		...notes.X,
		displayAftertimeSeconds: 24.2,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 24.7,
	},
	{
		...notes.X,
		displayAftertimeSeconds: 26.5,
	},
	{
		...notes.C,
		displayAftertimeSeconds: 27,
	},
	{
		...notes.U,
		displayAftertimeSeconds: 27.8,
	},
	{
		...notes.Y,
		displayAftertimeSeconds: 28.5,
	},
];
