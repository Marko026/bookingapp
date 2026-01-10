"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUser, loginAdmin } from "@/lib/auth";

export default function LoginPage() {
	const t = useTranslations("Admin.login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const result = await getCurrentUser();
			if (result.success) {
				router.push("/admin/dashboard");
			}
		};
		checkAuth();
	}, [router]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoggingIn(true);
		setLoginError("");

		try {
			const result = await loginAdmin(email, password);

			if (result.success) {
				router.push("/admin/dashboard");
			} else {
				setLoginError(result.error || t("error"));
			}
		} catch (error) {
			console.error("Login error:", error);
			setLoginError(t("unexpectedError"));
		} finally {
			setIsLoggingIn(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white p-4">
			<Card className="w-full max-w-md shadow-2xl rounded-3xl border-0 bg-white/90 backdrop-blur-sm">
				<CardHeader className="space-y-1 pb-6">
					<CardTitle className="text-4xl font-serif font-bold text-center text-gray-900">
						{t("title")}
					</CardTitle>
					<p className="text-center text-amber-600 font-medium tracking-wide uppercase text-xs">
						{t("subtitle")}
					</p>
				</CardHeader>
				<CardContent className="px-8 pb-8">
					<form onSubmit={handleLogin} className="space-y-5">
						<div className="space-y-2">
							<label className="text-sm font-bold text-gray-700 block">
								{t("emailLabel")}
							</label>
							<Input
								type="email"
								placeholder={t("emailPlaceholder")}
								className="py-7 rounded-2xl text-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 transition-all bg-gray-50 focus:bg-white"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoggingIn}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-gray-700 block">
								{t("passwordLabel")}
							</label>
							<Input
								type="password"
								placeholder={t("passwordPlaceholder")}
								className="py-7 rounded-2xl text-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 transition-all bg-gray-50 focus:bg-white"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoggingIn}
							/>
						</div>

						{loginError && (
							<div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-in slide-in-from-top-1">
								<AlertCircle size={20} className="text-red-600 flex-shrink-0" />
								<span className="text-red-700 font-medium text-base">
									{loginError}
								</span>
							</div>
						)}

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="remember"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
							/>
							<label
								htmlFor="remember"
								className="text-base font-medium text-gray-700 cursor-pointer select-none"
							>
								{t("rememberMe")}
							</label>
						</div>

						<Button
							type="submit"
							className="w-full py-7 text-xl font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white transition-all shadow-lg hover:shadow-amber-500/30 transform hover:-translate-y-0.5"
							disabled={isLoggingIn}
						>
							{isLoggingIn ? (
								<>
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block mr-2" />
									{t("loading")}
								</>
							) : (
								t("loginButton")
							)}
						</Button>

						<div className="text-center pt-6 border-t border-gray-100 mt-6">
							<p className="text-sm text-gray-400">{t("footer")}</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
