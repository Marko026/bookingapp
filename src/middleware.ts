import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
	// First, handle i18n routing
	const i18nResponse = handleI18nRouting(request);

	// Create a response object that we can use for Supabase
	const supabaseResponse = i18nResponse;

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value),
					);
					// If we're setting cookies, we need to make sure they're in the response too
					// Since i18n middleware might have already created a response, we update it
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const pathname = request.nextUrl.pathname;

	// Paths that require auth (stripping locale)
	const segments = pathname.split("/");
	const locale = segments[1];
	const pathWithoutLocale = segments.slice(2).join("/");
	const isAdminPath = pathWithoutLocale.startsWith("admin");
	const isLogin = pathWithoutLocale === "admin/login";

	// 1. If trying to access ANY admin page but NOT logged in -> Redirect to login
	if (isAdminPath && !isLogin && !user) {
		const url = request.nextUrl.clone();
		url.pathname = `/${locale}/admin/login`;
		return NextResponse.redirect(url);
	}

	// 2. If trying to access login but ALREADY logged in -> Redirect to dashboard
	if (isLogin && user) {
		const url = request.nextUrl.clone();
		url.pathname = `/${locale}/admin/dashboard`;
		return NextResponse.redirect(url);
	}

	// 3. Verify admin role in middleware for extra security
	if (isAdminPath && !isLogin && user) {
		// Check database for admin role
		const { data: adminRecord } = await supabase
			.from("admin_users")
			.select("role")
			.eq("user_id", user.id)
			.single();

		const isDbAdmin = adminRecord?.role === "admin";

		// Fallback to env vars if not found in DB (migration period)
		const allowedEmails = [
			process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
			process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
		].filter(Boolean);

		const isEnvAdmin = allowedEmails.includes(user.email || "");

		if (!isDbAdmin && !isEnvAdmin) {
			// Not an admin, sign out and redirect to home
			await supabase.auth.signOut();
			const url = request.nextUrl.clone();
			url.pathname = `/${locale}`;
			return NextResponse.redirect(url);
		}
	}

	return supabaseResponse;
}

export const config = {
	matcher: [
		// Enable a redirect to a matching locale at the root
		"/",

		// Set a cookie to remember the last locale for next requests
		"/(en|sr)/:path*",

		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
