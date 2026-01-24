"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
	ssr: false,
	loading: () => (
		<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl" />
	),
});

interface ApartmentLocationProps {
	lat: number;
	lng: number;
	popupText?: string;
}

export function ApartmentLocation({
	lat,
	lng,
	popupText,
}: ApartmentLocationProps) {
	return <LocationMap lat={lat} lng={lng} popupText={popupText} />;
}
