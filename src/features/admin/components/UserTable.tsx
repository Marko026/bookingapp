"use client";

import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { UserWithRole } from "@/features/admin/actions";

interface UserTableProps {
	users: UserWithRole[];
	isLoading: boolean;
	isUpdating: string | null;
	onToggleAdmin: (user: UserWithRole) => void;
}

export function UserTable({
	users,
	isLoading,
	isUpdating,
	onToggleAdmin,
}: UserTableProps) {
	const t = useTranslations("Admin.users");

	return (
		<div className="space-y-4">
			{/* Mobile View: Cards */}
			<div className="grid grid-cols-1 gap-4 md:hidden">
				{isLoading ? (
					<Card className="p-8 text-center text-gray-400 rounded-2xl">
						{t("loading")}
					</Card>
				) : users.length === 0 ? (
					<Card className="p-8 text-center text-gray-400 rounded-2xl">
						{t("noUsers")}
					</Card>
				) : (
					users.map((user) => (
						<Card
							key={user.id}
							className="p-5 rounded-2xl border-gray-100 shadow-sm space-y-4"
						>
							<div className="flex justify-between items-start">
								<div className="space-y-1">
									<p className="text-xs font-bold text-gray-400 uppercase">
										{t("table.email")}
									</p>
									<p className="font-bold text-gray-900 break-all">
										{user.email}
									</p>
								</div>
								{user.role === "admin" ? (
									<Badge className="bg-purple-100 text-purple-800">
										<ShieldCheck className="h-3 w-3 mr-1" /> Admin
									</Badge>
								) : (
									<Badge variant="outline" className="text-gray-500">
										{t("table.unknown")}
									</Badge>
								)}
							</div>
							<div className="flex justify-between items-end pt-2 border-t border-gray-50">
								<div className="space-y-1">
									<p className="text-[10px] font-bold text-gray-400 uppercase">
										{t("table.status")}
									</p>
									<p className="text-sm text-gray-500">
										{new Date(user.created_at).toLocaleDateString()}
									</p>
								</div>
								<Button
									variant={user.role === "admin" ? "outline" : "default"}
									size="sm"
									disabled={isUpdating === user.id}
									className={`rounded-xl ${
										user.role === "admin"
											? "border-red-200 text-red-600"
											: "bg-black text-white"
									}`}
									onClick={() => onToggleAdmin(user)}
								>
									{user.role === "admin"
										? t("table.demote")
										: t("table.promote")}
								</Button>
							</div>
						</Card>
					))
				)}
			</div>

			{/* Desktop View: Table */}
			<Card className="hidden md:block rounded-[2rem] border-gray-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-gray-50/50">
							<TableRow>
								<TableHead className="p-6 font-bold text-xs uppercase">
									{t("table.email")}
								</TableHead>
								<TableHead className="p-6 font-bold text-xs uppercase">
									{t("table.role")}
								</TableHead>
								<TableHead className="p-6 font-bold text-xs uppercase">
									{t("table.status")}
								</TableHead>
								<TableHead className="p-6 font-bold text-xs uppercase text-right">
									{t("table.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="p-12 text-center text-gray-400"
									>
										{t("loading")}
									</TableCell>
								</TableRow>
							) : users.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="p-12 text-center text-gray-400"
									>
										{t("noUsers")}
									</TableCell>
								</TableRow>
							) : (
								users.map((user) => (
									<TableRow key={user.id} className="hover:bg-gray-50">
										<TableCell className="p-6">
											<div className="font-bold text-gray-900">
												{user.email}
											</div>
										</TableCell>
										<TableCell className="p-6">
											{user.role === "admin" ? (
												<Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
													<ShieldCheck className="h-3 w-3 mr-1" /> Admin
												</Badge>
											) : (
												<Badge variant="outline" className="text-gray-500">
													{t("table.unknown")}
												</Badge>
											)}
										</TableCell>
										<TableCell className="p-6 text-sm text-gray-500">
											{new Date(user.created_at).toLocaleDateString()}
										</TableCell>
										<TableCell className="p-6 text-right">
											<Button
												variant={user.role === "admin" ? "outline" : "default"}
												size="sm"
												disabled={isUpdating === user.id}
												className={`rounded-lg ${
													user.role === "admin"
														? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
														: "bg-black text-white hover:bg-gray-800"
												}`}
												onClick={() => onToggleAdmin(user)}
											>
												{user.role === "admin" ? (
													<>
														<ShieldAlert className="h-4 w-4 mr-2" />{" "}
														{t("table.demote")}
													</>
												) : (
													<>
														<Shield className="h-4 w-4 mr-2" />{" "}
														{t("table.promote")}
													</>
												)}
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</Card>
		</div>
	);
}
