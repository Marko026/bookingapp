"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Instagram, Facebook } from "lucide-react";
import { FooterScrollTop } from "./FooterScrollTop";

function SmoothScrollLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		const [path, hash] = href.split("#");
		if ((!path || path === "/") && hash) {
			const el = document.getElementById(hash);
			if (el) {
				e.preventDefault();
				el.scrollIntoView({ behavior: "smooth" });
			}
		}
	};
	return (
		<a href={href} className={className} onClick={handleClick}>
			{children}
		</a>
	);
}

export function Footer() {
	const t = useTranslations("Footer");

	return (
		<footer className="bg-gray-900 text-white py-12 px-4 md:px-6">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
				<div>
					<FooterScrollTop />
					<p className="text-gray-400">{t("subtitle")}</p>
				</div>
				<div>
					<h4 className="font-bold mb-4">{t("contact")}</h4>
					<a href="mailto:jtodorovic059@gmail.com" className="text-gray-400 hover:text-white transition-colors">
						jtodorovic059@gmail.com
					</a>
					<p className="text-gray-400">+381 69 3319707</p>
				</div>
				<div>
					<h4 className="font-bold mb-4">{t("followUs")}</h4>
					<div className="flex gap-4">
						<Link
							href="https://www.instagram.com/jasmin.9138?utm_source=qr&igsh=OXdqYXd2OGk5dzRm"
							className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
						>
							<Instagram size={24} />
						</Link>
						<Link
							href="https://www.facebook.com/share/1DqfxjxrBS/"
							className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
						>
							<Facebook size={24} />
						</Link>
					</div>
				</div>
			</div>
			<div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
				{`© 2026 Apartmani Todorović. ${t("rights")}`}
			</div>
		</footer>
	);
}
