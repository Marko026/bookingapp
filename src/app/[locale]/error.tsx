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
			<div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
				<div className="relative flex justify-center">
					<div className="absolute inset-0 bg-amber-200/20 blur-3xl rounded-full" />
					<div className="relative p-8 bg-white border border-amber-100 text-amber-600 rounded-[2.5rem] shadow-2xl shadow-amber-200/50">
						<AlertCircle size={64} strokeWidth={1} className="animate-pulse" />
					</div>
				</div>

				<div className="space-y-4">
					<h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
						Ups! Nešto nije u redu
					</h1>
					<p className="text-gray-500 text-xl leading-relaxed">
						Naišli smo na mali problem. Bez brige, vaši podaci su sigurni.
					</p>

					<div className="mt-8 p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 group transition-all hover:bg-white">
						<p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">
							Detalji greške
						</p>
						<code className="text-xs font-mono text-gray-400 break-all opacity-70 group-hover:opacity-100 transition-opacity">
							{error.message ||
								(error.digest && `ID: ${error.digest}`) ||
								"Sistemska greška (0x01)"}
						</code>
					</div>
				</div>

				<div className="flex flex-col gap-3 pt-6">
					<Button
						onClick={() => reset()}
						className="w-full rounded-2xl bg-amber-600 text-white hover:bg-amber-700 h-16 text-lg font-bold shadow-xl shadow-amber-600/20 transition-all active:scale-[0.98] hover:-translate-y-0.5"
					>
						<RefreshCw size={20} className="mr-3" />
						Pokušaj ponovo
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							window.location.href = "/";
						}}
						className="w-full rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-14 text-base font-medium transition-all"
					>
						<ArrowLeft size={18} className="mr-2" />
						Vrati se na početnu
					</Button>
				</div>
			</div>
		</div>
	);
}
