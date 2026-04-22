import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
	confirmed: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
	pending: "bg-yellow-100 text-yellow-800",
	admin: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

const statusLabels: Record<string, string> = {
	admin: "Admin",
};

type BookingStatus = "confirmed" | "cancelled" | "pending";
type UserRole = "admin";

interface StatusBadgeProps {
	status: BookingStatus | UserRole | string;
	icon?: ReactNode;
	className?: string;
}

export function StatusBadge({ status, icon, className }: StatusBadgeProps) {
	const style = statusStyles[status] ?? "bg-yellow-100 text-yellow-800";
	const label = statusLabels[status] ?? status;

	return (
		<Badge className={cn(style, className)}>
			{icon}
			{label}
		</Badge>
	);
}
