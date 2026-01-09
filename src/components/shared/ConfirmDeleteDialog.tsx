"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title: string;
	description: string;
	isLoading?: boolean;
}

export function ConfirmDeleteDialog({
	open,
	onOpenChange,
	onConfirm,
	title,
	description,
	isLoading,
}: ConfirmDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-2xl max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3 text-destructive mb-2">
						<AlertTriangle className="h-5 w-5" />
						<DialogTitle>{title}</DialogTitle>
					</div>
					<DialogDescription className="text-base">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-4">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className="rounded-xl"
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}
						className="rounded-xl px-8"
					>
						{isLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
