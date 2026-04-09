import { Skeleton } from "@/components/ui/skeleton";

export default function ApartmentLoading() {
	return (
		<div className="bg-white min-h-screen pb-12 md:pb-24 pt-20 md:pt-28">
			<div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
				{/* Left Column: Content */}
				<div className="lg:col-span-8">
					{/* Header Section */}
					<div className="mb-6 md:mb-8">
						<Skeleton className="h-12 w-3/4 mb-4" />
						<div className="flex items-center gap-4">
							<Skeleton className="h-6 w-24 rounded-full" />
							<Skeleton className="h-6 w-32 rounded-full" />
							<Skeleton className="h-6 w-40 rounded-full" />
						</div>
					</div>

					{/* Image Grid Skeleton */}
					<div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] mb-12 rounded-[2.5rem] overflow-hidden">
						<Skeleton className="col-span-2 row-span-2" />
						<Skeleton className="col-span-1 row-span-1" />
						<Skeleton className="col-span-1 row-span-1" />
						<Skeleton className="col-span-1 row-span-1" />
						<Skeleton className="col-span-1 row-span-1" />
					</div>

					{/* Mobile Image Skeleton */}
					<Skeleton className="md:hidden h-[35vh] rounded-[1.5rem] mb-6" />

					{/* Details Skeleton */}
					<div className="flex flex-col gap-8 md:gap-10">
						<div className="flex gap-4 py-6 border-y border-gray-100 overflow-hidden">
							<div className="flex items-center gap-3">
								<Skeleton className="h-12 w-12 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Skeleton className="h-12 w-12 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Skeleton className="h-12 w-12 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>

						<div className="space-y-6">
							<Skeleton className="h-8 w-48" />
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								<Skeleton className="h-16 rounded-2xl" />
								<Skeleton className="h-16 rounded-2xl" />
								<Skeleton className="h-16 rounded-2xl" />
								<Skeleton className="h-16 rounded-2xl" />
								<Skeleton className="h-16 rounded-2xl" />
								<Skeleton className="h-16 rounded-2xl" />
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Sticky Widget Skeleton */}
				<div className="lg:col-span-4">
					<div className="sticky top-24 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] p-8 space-y-6">
						<div className="flex justify-between items-center">
							<Skeleton className="h-10 w-32" />
							<Skeleton className="h-8 w-16 rounded-full" />
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Skeleton className="h-16 rounded-2xl" />
							<Skeleton className="h-16 rounded-2xl" />
						</div>
						<Skeleton className="h-[300px] w-full rounded-[1.5rem]" />
						<Skeleton className="h-14 w-full rounded-2xl" />
					</div>
				</div>
			</div>
		</div>
	);
}
