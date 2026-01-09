import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
	label: string;
	error?: string;
	containerClassName?: string;
}

export function FormTextarea({
	label,
	error,
	containerClassName,
	className,
	...props
}: FormTextareaProps) {
	return (
		<div className={cn("space-y-2", containerClassName)}>
			<Label className="text-sm font-medium">{label}</Label>
			<Textarea
				className={cn(error && "border-destructive", className)}
				{...props}
			/>
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
