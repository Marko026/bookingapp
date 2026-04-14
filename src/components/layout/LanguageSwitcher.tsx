"use client";

import { Languages } from "lucide-react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
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

	const currentLang = languages.find((l) => l.code === locale) || languages[1];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				<Languages className="h-4 w-4" />
				<span className="hidden md:inline">
					{currentLang?.flag} {currentLang?.name}
				</span>
				<span className="md:hidden">{currentLang?.flag}</span>
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
