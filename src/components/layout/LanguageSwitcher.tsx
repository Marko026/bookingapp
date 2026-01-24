"use client";

import { Languages } from "lucide-react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
	const t = useTranslations("Navigation");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();

	function onSelectChange(nextLocale: string) {
		router.replace(
			// @ts-expect-error
			{ pathname, params },
			{ locale: nextLocale },
		);
	}

	const languages = [
		{ code: "en", name: "English", flag: "🇬🇧" },
		{ code: "sr", name: "Srpski", flag: "🇷🇸" },
	];

	const currentLang = languages.find((l) => l.code === locale);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="flex items-center gap-2 hover:bg-neutral-100 transition-colors"
					aria-label={t("switchLanguage")}
				>
					<Languages className="h-4 w-4" />
					<span className="hidden md:inline">
						<span role="img" aria-label={currentLang?.name}>
							{currentLang?.flag}
						</span>{" "}
						{currentLang?.name}
					</span>
					<span className="md:hidden" role="img" aria-label={currentLang?.name}>
						{currentLang?.flag}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						onClick={() => onSelectChange(lang.code)}
						className={`${locale === lang.code ? "bg-neutral-100 font-medium" : ""} cursor-pointer`}
					>
						<span className="mr-2">{lang.flag}</span>
						{lang.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
