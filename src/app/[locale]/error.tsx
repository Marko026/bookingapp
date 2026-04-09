"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	// We avoid next-intl here because errors can happen before i18n is initialized
	// Hardcoded fallback text ensures the error page always works.

	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Global React Error Caught:", error);
	}, [error]);

	return (
		<div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FFFDF9]">
			<div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
				<div className="flex justify-center">
					<div className="p-6 bg-amber-50 text-amber-600 rounded-[2rem] ring-8 ring-amber-50/50 shadow-sm">
						<AlertCircle size={48} strokeWidth={1.5} />
					</div>
				</div>

				<div className="space-y-3">
					<h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
						Došlo je do greške
					</h1>
					<p className="text-gray-500 text-lg">
						Nešto nije u redu. Molimo vas da pokušate ponovo ili se vratite na početnu stranu.
						<span className="block text-xs font-mono mt-4 text-gray-400 bg-gray-50 p-2 rounded-lg truncate">
							{error.message || (error.digest && `ID: ${error.digest}`) || "Unknown error"}
						</span>
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 pt-4">
					<Button
						onClick={() => reset()}
						className="flex-1 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 h-14 text-base font-bold shadow-xl shadow-amber-600/20 transition-all active:scale-95"
					>
						<RefreshCw size={18} className="mr-2" />
						Pokušaj ponovo
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							window.location.href = "/";
						}}
						className="flex-1 rounded-2xl border-gray-200 text-gray-900 bg-white hover:bg-gray-50 h-14 text-base font-bold transition-all active:scale-95 shadow-sm"
					>
						<ArrowLeft size={18} className="mr-2" />
						Početna strana
					</Button>
				</div>
			</div>
		</div>
	);
}
