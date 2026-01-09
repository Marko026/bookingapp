"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Edit2, Trash, XCircle } from "lucide-react";
import { useAdminBookings } from "@/features/admin/hooks/useAdminBookings";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Booking } from "@/types";

export function BookingsManager() {
	const {
		bookings,
		pagination,
		isLoading,
		fetchBookings,
		updateBookingStatus,
		removeBooking,
		updateBookingDetails,
	} = useAdminBookings();

	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean;
		id: number | null;
	}>({ isOpen: false, id: null });

	const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
	const [editForm, setEditForm] = useState({
		checkIn: "",
		checkOut: "",
		totalPrice: 0,
	});

	// Fetch on mount
	useEffect(() => {
		fetchBookings(1);
	}, [fetchBookings]);

	const handleDelete = async () => {
		if (deleteConfirm.id) {
			await removeBooking(deleteConfirm.id);
			setDeleteConfirm({ isOpen: false, id: null });
		}
	};

	const handleStartEdit = (booking: Booking) => {
		setEditingBooking(booking);
		setEditForm({
			checkIn: booking.checkIn,
			checkOut: booking.checkOut,
			totalPrice: booking.totalPrice,
		});
	};

	const handleSaveEdit = async () => {
		if (editingBooking) {
			await updateBookingDetails(editingBooking.id, editForm);
			setEditingBooking(null);
		}
	};

	return (
		<Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
			<div className="hidden md:block overflow-x-auto min-h-[500px]">
				<Table>
					<TableHeader className="bg-gray-50/50">
						<TableRow>
							<TableHead className="p-6 font-bold text-xs uppercase">
								Guest
							</TableHead>
							<TableHead className="p-6 font-bold text-xs uppercase">
								Dates
							</TableHead>
							<TableHead className="p-6 font-bold text-xs uppercase">
								Apartment
							</TableHead>
							<TableHead className="p-6 font-bold text-xs uppercase">
								Total
							</TableHead>
							<TableHead className="p-6 font-bold text-xs uppercase">
								Status
							</TableHead>
							<TableHead className="p-6 font-bold text-xs uppercase">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{bookings.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="p-12 text-center text-gray-400">
									{isLoading ? "Loading..." : "No bookings yet."}
								</TableCell>
							</TableRow>
						) : (
							bookings.map((booking) => (
								<TableRow
									key={booking.id}
									className="cursor-pointer hover:bg-gray-50"
								>
									<TableCell className="p-6">
										<div className="font-bold text-gray-900">
											{booking.guestName}
										</div>
										<div className="text-xs text-gray-400">
											{booking.guestEmail}
										</div>
									</TableCell>
									<TableCell className="p-6 text-sm">
										{new Date(booking.checkIn).toLocaleDateString()} <br />
										<span className="text-gray-400 text-xs">to</span>{" "}
										{new Date(booking.checkOut).toLocaleDateString()}
									</TableCell>
									<TableCell className="p-6 text-sm">
										{/* Apartment name is usually populated in booking object if calling correct endpoint */}
										ID: {booking.apartmentId}
									</TableCell>
									<TableCell className="p-6 font-bold text-lg">
										{booking.totalPrice}€
									</TableCell>
									<TableCell className="p-6">
										<Badge
											className={
												booking.status === "confirmed"
													? "bg-green-100 text-green-800"
													: booking.status === "cancelled"
														? "bg-red-100 text-red-800"
														: "bg-yellow-100 text-yellow-800"
											}
										>
											{booking.status}
										</Badge>
									</TableCell>
									<TableCell className="p-6">
										<div className="flex gap-2">
											{booking.status === "pending" && (
												<>
													<Button
														size="icon"
														className="rounded-full bg-black"
														onClick={() =>
															updateBookingStatus(booking.id, "confirmed")
														}
													>
														<CheckCircle size={16} />
													</Button>
													<Button
														size="icon"
														variant="destructive"
														className="rounded-full"
														onClick={() =>
															updateBookingStatus(booking.id, "cancelled")
														}
													>
														<XCircle size={16} />
													</Button>
												</>
											)}
											<Button
												size="icon"
												variant="outline"
												className="rounded-full"
												onClick={() => handleStartEdit(booking)}
											>
												<Edit2 size={16} />
											</Button>
											<Button
												size="icon"
												variant="outline"
												className="rounded-full border-red-300 text-red-600"
												onClick={() =>
													setDeleteConfirm({ isOpen: true, id: booking.id })
												}
											>
												<Trash size={16} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="p-4 border-t border-gray-100">
				{pagination.totalPages > 1 && (
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									className="cursor-pointer"
									onClick={() => {
										if (pagination.page > 1) {
											fetchBookings(pagination.page - 1);
										}
									}}
								/>
							</PaginationItem>

							{Array.from({ length: pagination.totalPages }).map((_, i) => (
								<PaginationItem key={i}>
									<PaginationLink
										className="cursor-pointer"
										isActive={pagination.page === i + 1}
										onClick={() => fetchBookings(i + 1)}
									>
										{i + 1}
									</PaginationLink>
								</PaginationItem>
							))}

							<PaginationItem>
								<PaginationNext
									className="cursor-pointer"
									onClick={() => {
										if (pagination.page < pagination.totalPages) {
											fetchBookings(pagination.page + 1);
										}
									}}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onOpenChange={(open) =>
					setDeleteConfirm((prev) => ({ ...prev, isOpen: open }))
				}
				onConfirm={handleDelete}
				title="Delete Booking"
				description="Are you sure you want to delete this booking? This action cannot be undone."
			/>

			<Dialog
				open={!!editingBooking}
				onOpenChange={(open) => !open && setEditingBooking(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Booking</DialogTitle>
						<DialogDescription>Make changes to the booking.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="checkIn" className="text-right">
								Check In
							</Label>
							<Input
								id="checkIn"
								value={editForm.checkIn}
								onChange={(e) =>
									setEditForm({ ...editForm, checkIn: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="checkOut" className="text-right">
								Check Out
							</Label>
							<Input
								id="checkOut"
								value={editForm.checkOut}
								onChange={(e) =>
									setEditForm({ ...editForm, checkOut: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="totalPrice" className="text-right">
								Price
							</Label>
							<Input
								id="totalPrice"
								type="number"
								value={editForm.totalPrice}
								onChange={(e) =>
									setEditForm({
										...editForm,
										totalPrice: Number(e.target.value),
									})
								}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingBooking(null)}>
							Cancel
						</Button>
						<Button onClick={handleSaveEdit}>Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
