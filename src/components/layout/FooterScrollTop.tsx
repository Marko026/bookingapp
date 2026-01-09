"use client";

import { useLenis } from "lenis/react";
import { Logo } from "@/components/ui/Logo";

export function FooterScrollTop() {
	const lenis = useLenis();

	return (
		<button
			type="button"
			onClick={() => lenis?.scrollTo(0)}
			className="focus:outline-none"
			aria-label="Scroll to top"
		>
			<Logo variant="light" className="mb-6 cursor-pointer" />
		</button>
	);
}
