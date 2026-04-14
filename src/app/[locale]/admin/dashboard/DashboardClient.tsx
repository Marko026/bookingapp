"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AttractionsTab } from "@/components/admin/AttractionsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApartmentsManager } from "@/features/admin/components/dashboard/ApartmentsManager";
import { BookingsManager } from "@/features/admin/components/dashboard/BookingsManager";
import { UsersTab } from "@/features/admin/components/UsersTab";
import { getCurrentUser, logoutAdmin } from "@/lib/auth";

export function DashboardClient() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const result = await getCurrentUser();
			if (!result.success) {
				router.push("/admin/login");
			} else {
				setIsAuthenticated(true);
			}
		};
		checkAuth();
	}, [router]);

	const handleLogout = async () => {
		await logoutAdmin();
		router.push("/admin/login");
	};

	if (!isAuthenticated) return null;

	return (
		<div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-6 pb-20">
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
					<h1 className="text-4xl font-serif font-bold text-black">
						Dashboard
					</h1>
					<Button
						variant="outline"
						onClick={handleLogout}
						className="rounded-full border-gray-200 hover:bg-red-50 hover:text-red-500"
					>
						<LogOut size={20} className="mr-2" /> Logout
					</Button>
				</div>

				<Tabs defaultValue="bookings" className="w-full">
					<div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
						<TabsList className="bg-white p-1 rounded-full border border-gray-100 shadow-sm mb-4 h-auto inline-flex min-w-max">
							<TabsTrigger
								value="bookings"
								className="rounded-full px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-black data-[state=active]:text-white whitespace-nowrap"
							>
								Bookings
							</TabsTrigger>
							<TabsTrigger
								value="apartments"
								className="rounded-full px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-black data-[state=active]:text-white whitespace-nowrap"
							>
								Apartments
							</TabsTrigger>
							<TabsTrigger
								value="users"
								className="rounded-full px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-black data-[state=active]:text-white whitespace-nowrap"
							>
								Team & Users
							</TabsTrigger>
							<TabsTrigger
								value="attractions"
								className="rounded-full px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-black data-[state=active]:text-white whitespace-nowrap"
							>
								Attractions
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="bookings">
						<BookingsManager />
					</TabsContent>

					<TabsContent value="apartments">
						<ApartmentsManager />
					</TabsContent>

					<TabsContent value="users">
						<UsersTab />
					</TabsContent>

					<TabsContent value="attractions">
						<AttractionsTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
