"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { logoutAdmin } from "@/lib/auth";

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function SessionTimeout() {
	const router = useRouter();
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const handleLogout = useCallback(async () => {
		await logoutAdmin();
		router.push("/admin/login");
	}, [router]);

	const resetTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		timerRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
	}, [handleLogout]);

	useEffect(() => {
		// Events that indicate user activity
		const events = [
			"mousedown",
			"mousemove",
			"keypress",
			"scroll",
			"touchstart",
			"click",
		];

		// Set initial timer
		resetTimer();

		// Add event listeners
		for (const event of events) {
			window.addEventListener(event, resetTimer);
		}

		// Cleanup
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			for (const event of events) {
				window.removeEventListener(event, resetTimer);
			}
		};
	}, [resetTimer]);

	return null; // This component doesn't render anything
}
