"use client";

import { Edit2, Trash } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { stripHtml } from "@/lib/utils";
import type { Attraction } from "@/types";

interface AttractionListProps {
	attractions: Attraction[];
	onEdit: (attraction: Attraction) => void;
	onDelete: (id: string) => void;
}

export function AttractionList({
	attractions,
	onEdit,
	onDelete,
}: AttractionListProps) {
	const t = useTranslations("Admin.attractions");

	if (attractions.length === 0) {
		return (
			<div className="p-12 text-center text-gray-400">{t("noAttractions")}</div>
		);
	}

	return (
		<div className="grid gap-6">
			{attractions.map((attr) => (
				<Card
					key={attr.id}
					className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden"
				>
					<CardContent className="p-6">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
							<div className="flex gap-6 items-center">
								{attr.image && (
									<div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
										<Image
											src={attr.image}
											alt={attr.title}
											fill
											className="object-cover"
											sizes="96px"
										/>
									</div>
								)}
								<div>
									<h3 className="text-xl font-serif font-bold text-gray-900">
										{attr.title}
									</h3>
									<p className="text-gray-500 text-sm">{attr.distance}</p>
									<p className="text-gray-600 mt-1 line-clamp-1">
										{stripHtml(attr.description || "")}
									</p>
								</div>
							</div>
							<div className="flex gap-2 w-full md:w-auto">
								<Button
									variant="outline"
									onClick={() => onEdit(attr)}
									className="flex-1 md:flex-none rounded-xl"
								>
									<Edit2 size={16} className="mr-2" /> {t("edit")}
								</Button>
								<Button
									variant="ghost"
									onClick={() => onDelete(attr.id)}
									className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
								>
									<Trash size={16} />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
