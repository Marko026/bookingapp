import { SessionTimeout } from "@/components/admin/SessionTimeout";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<SessionTimeout />
			{children}
		</>
	);
}
