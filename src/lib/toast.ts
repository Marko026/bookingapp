import { type ExternalToast, toast as sonnerToast } from "sonner";

/**
 * Centralizovani toast notification sistem sa brendiranim stilovima
 *
 * Design specifikacije:
 * - Success: zelena #10b981
 * - Error: crvena #ef4444
 * - Info: plava #3b82f6
 * - Warning: narandžasta #f59e0b
 *
 * Trajanje:
 * - Success/Info: 4000ms
 * - Error/Warning: 6000ms (duže za action-required poruke)
 */

const toastConfig = {
	success: {
		duration: 4000,
		className: "toast-success",
	},
	error: {
		duration: 6000,
		className: "toast-error",
	},
	info: {
		duration: 4000,
		className: "toast-info",
	},
	warning: {
		duration: 6000,
		className: "toast-warning",
	},
};

export const showToast = {
	/**
	 * Prikaz success toast notifikacije (zelena)
	 * @param message - Glavna poruka
	 * @param options - Opcioni parametri (description, itd.)
	 */
	success: (message: string, options?: ExternalToast) => {
		sonnerToast.success(message, {
			...options,
			duration: toastConfig.success.duration,
			className: toastConfig.success.className,
		});
	},

	/**
	 * Prikaz error toast notifikacije (crvena)
	 * @param message - Glavna poruka
	 * @param options - Opcioni parametri (description, itd.)
	 */
	error: (message: string, options?: ExternalToast) => {
		sonnerToast.error(message, {
			...options,
			duration: toastConfig.error.duration,
			className: toastConfig.error.className,
		});
	},

	/**
	 * Prikaz info toast notifikacije (plava)
	 * @param message - Glavna poruka
	 * @param options - Opcioni parametri (description, itd.)
	 */
	info: (message: string, options?: ExternalToast) => {
		sonnerToast.info(message, {
			...options,
			duration: toastConfig.info.duration,
			className: toastConfig.info.className,
		});
	},

	/**
	 * Prikaz warning toast notifikacije (narandžasta)
	 * @param message - Glavna poruka
	 * @param options - Opcioni parametri (description, itd.)
	 */
	warning: (message: string, options?: ExternalToast) => {
		sonnerToast.warning(message, {
			...options,
			duration: toastConfig.warning.duration,
			className: toastConfig.warning.className,
		});
	},
};

// Re-export toast kao alias za kompatibilnost
export const toast = showToast;
