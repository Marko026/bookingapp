import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
	return (
		<div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-6 pb-20">
			<div className="max-w-6xl mx-auto">
				{/* Dashboard Header */}
				<div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-10 w-32 rounded-full" />
				</div>

				{/* Tabs Header Skeleton */}
				<div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm mb-8 h-auto flex gap-1">
					<Skeleton className="h-12 w-32 rounded-full" />
					<Skeleton className="h-12 w-32 rounded-full" />
					<Skeleton className="h-12 w-32 rounded-full" />
					<Skeleton className="h-12 w-32 rounded-full" />
				</div>

				{/* Content Area Skeleton */}
				<div className="space-y-6">
					<div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
						<div className="flex justify-between items-center border-b border-gray-50 pb-6">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-10 w-40 rounded-full" />
						</div>

						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50"
								>
									<Skeleton className="h-12 w-12 rounded-xl" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-48" />
										<Skeleton className="h-3 w-32" />
									</div>
									<Skeleton className="h-8 w-24 rounded-full" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
