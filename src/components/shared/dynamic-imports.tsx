"use client";

import dynamic from "next/dynamic";

export const MapPicker = dynamic(() => import("@/components/admin/MapPicker"), {
	ssr: false,
	loading: () => (
		<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />
	),
});

export const RichTextEditor = dynamic(
	() =>
		import("@/components/shared/RichTextEditor").then(
			(mod) => mod.RichTextEditor,
		),
	{
		ssr: false,
		loading: () => (
			<div className="h-[150px] w-full bg-gray-50 animate-pulse rounded-[1.5rem] border border-gray-100" />
		),
	},
);