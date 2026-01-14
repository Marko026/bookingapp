import { useCallback, useState } from "react";
import {
	deleteApartmentAction,
	getAllApartmentsAdmin,
	updateApartment as updateApartmentAction,
} from "@/features/listings/actions";
import { toast } from "@/lib/toast";
import type { Apartment } from "@/types";

export function useAdminApartments() {
	const [apartments, setApartments] = useState<Apartment[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchApartments = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await getAllApartmentsAdmin();
			if (result.success && result.apartments) {
				setApartments(result.apartments as unknown as Apartment[]);
			}
		} catch (error) {
			console.error("Failed to fetch apartments:", error);
			toast.error("Greška pri učitavanju apartmana");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const removeApartment = async (id: number) => {
		try {
			const result = await deleteApartmentAction({ success: false }, { id });
			if (result.success) {
				await fetchApartments();
				toast.success("Apartman je obrisan");
				return true;
			}
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Greška pri brisanju apartmana");
		}
		return false;
	};

	const saveApartment = async (id: number, formData: FormData) => {
		try {
			// Ensure ID is in formData for validation
			if (!formData.has("id")) {
				formData.append("id", id.toString());
			}

			const result = await updateApartmentAction({ success: false }, formData);
			if (result.success) {
				await fetchApartments();
				toast.success("Apartman je uspešno ažuriran");
				return true;
			} else {
				toast.error("Greška pri čuvanju", { description: result.message });
			}
		} catch (error) {
			console.error("Save error:", error);
			toast.error("Greška pri čuvanju apartmana");
		}
		return false;
	};

	return {
		apartments,
		isLoading,
		fetchApartments,
		removeApartment,
		saveApartment,
	};
}
