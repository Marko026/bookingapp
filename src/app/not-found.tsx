import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function NotFound() {
	return (
		<html lang="sr">
			<head>
				<title>Stranica nije pronađena | Apartmani Todorović</title>
			</head>
			<body>
				<div className="min-h-screen flex items-center justify-center p-6 bg-[#FFFDF9]">
					<div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
						<div className="flex justify-center">
							<div className="p-6 bg-gray-50 text-gray-400 rounded-[2rem] ring-8 ring-gray-50/50 shadow-sm">
								<AlertCircle size={48} strokeWidth={1.5} />
							</div>
						</div>

						<div className="space-y-3">
							<h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
								Stranica nije pronađena
							</h1>
							<p className="text-gray-500 text-lg">
								Izgleda da stranica koju tražite ne postoji ili je premeštena.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<Link href="/" className="w-full block">
								<Button className="w-full rounded-2xl bg-amber-600 text-white hover:bg-amber-700 h-14 text-base font-bold shadow-xl shadow-amber-600/20 transition-all active:scale-95">
									<ArrowLeft size={18} className="mr-2" />
									Nazad na početnu stranu
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
