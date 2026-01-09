import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRootPage() {
	const result = await getCurrentUser();

	if (result.success) {
		redirect("/admin/dashboard");
	} else {
		redirect("/admin/login");
	}
}
