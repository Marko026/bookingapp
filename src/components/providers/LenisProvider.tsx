"use client";

import Lenis from "@studio-freight/lenis";
import { usePathname } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
} from "react";

// Create a context for the Lenis instance
const LenisContext = createContext<Lenis | null>(null);

// Custom hook to use the Lenis instance
export const useLenis = () => {
	return useContext(LenisContext);
};

type LenisProviderProps = {
	children: ReactNode;
};

export default function LenisProvider({ children }: LenisProviderProps) {
	const pathname = usePathname();
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		const lenis = new Lenis({
			lerp: 0.1, // Lower value for smoother scrolling
			duration: 1.2, // Increased duration for a more luxurious feel
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), // Custom easing
			direction: "vertical",
			gestureDirection: "vertical",
			smoothTouch: false, // Disable for touch devices if not optimized
			touchMultiplier: 2, // Adjust touch scroll speed
			infinite: false,
		});

		lenisRef.current = lenis; // Store the instance in the ref

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			lenis.destroy();
			lenisRef.current = null; // Clear the ref on destroy
		};
	}, [pathname]); // Re-initialize lenis on pathname change for Next.js soft navigation

	return (
		<LenisContext.Provider value={lenisRef.current}>
			{children}
		</LenisContext.Provider>
	);
}
