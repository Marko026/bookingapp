import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

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
	if (!routing.locales.includes(locale as any)) {
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
		<html lang={locale} dir={direction} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
				suppressHydrationWarning
			>
				<NextIntlClientProvider messages={messages}>
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
					<SmoothScroll>
						<Navbar />
						<main className="min-h-screen">{children}</main>
						<Footer />
					</SmoothScroll>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
