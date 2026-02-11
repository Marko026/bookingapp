"use client";

import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/routing";

export function FooterScrollTop() {
	return (
		<Link
			href="/#hero"
			scroll={false}
			className="focus:outline-none block w-fit"
			aria-label="Scroll to top"
		>
			<Logo variant="light" className="mb-6 cursor-pointer" />
		</Link>
	);
}
