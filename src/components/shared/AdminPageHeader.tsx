import type React from "react";

interface AdminPageHeaderProps {
	title: string;
	action?: React.ReactNode;
	description?: string;
}

export function AdminPageHeader({
	title,
	action,
	description,
}: AdminPageHeaderProps) {
	return (
		<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
			<div>
				<h2 className="text-2xl font-serif font-bold text-gray-900">{title}</h2>
				{description && (
					<p className="text-sm text-gray-500 mt-1">{description}</p>
				)}
			</div>
			{action && <div className="flex gap-4 w-full md:w-auto">{action}</div>}
		</div>
	);
}
