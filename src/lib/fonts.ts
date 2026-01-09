import { Inter, Playfair_Display } from "next/font/google";

// These exports can be used if we need these specific fonts later,
// but currently we prioritize the global geist font.
export const playfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-playfair",
	display: "swap",
});

export const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});
