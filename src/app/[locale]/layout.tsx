import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata = {
	metadataBase: new URL("https://apartmani-todorovic.com"),
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages();

	// Determine direction (for future RTL support)
	const direction = ["ar", "he", "fa"].includes(locale) ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={direction} className="scroll-smooth">
			<body
				suppressHydrationWarning
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
			>
				<NextIntlClientProvider messages={messages} locale={locale}>
					<Toaster
						position="top-right"
						richColors
						expand={false}
						closeButton
						toastOptions={{
							style: {
								borderRadius: "12px",
								fontFamily: "var(--font-geist-sans)",
							},
						}}
					/>
					<Navbar />
					<main className="min-h-screen">{children}</main>
					<Footer />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
