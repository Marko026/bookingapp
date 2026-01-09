import Link from "next/link";
import { useTranslations } from "next-intl";
import { FooterScrollTop } from "./FooterScrollTop";

export function Footer() {
	const t = useTranslations("Footer");

	return (
		<footer className="bg-gray-900 text-white py-12 px-6">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
				<div>
					<FooterScrollTop />
					<p className="text-gray-400">{t("subtitle")}</p>
				</div>
				<div>
					<h4 className="font-bold mb-4">{t("contact")}</h4>
					<p className="text-gray-400">info@apartmanitodorovic.rs</p>
					<p className="text-gray-400">+381 60 123 4567</p>
				</div>
				<div>
					<h4 className="font-bold mb-4">{t("followUs")}</h4>
					<div className="flex gap-4">
						<Link
							href="https://instagram.com"
							className="text-gray-400 hover:text-white transition-colors"
						>
							Instagram
						</Link>
						<Link
							href="https://facebook.com"
							className="text-gray-400 hover:text-white transition-colors"
						>
							Facebook
						</Link>
					</div>
				</div>
			</div>
			<div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
				© {new Date().getFullYear()} Apartmani Todorović. {t("rights")}
			</div>
		</footer>
	);
}
