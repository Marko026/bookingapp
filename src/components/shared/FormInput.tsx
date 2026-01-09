import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.ComponentProps<typeof Input> {
	label: string;
	error?: string;
	containerClassName?: string;
}

export function FormInput({
	label,
	error,
	containerClassName,
	className,
	...props
}: FormInputProps) {
	return (
		<div className={cn("space-y-2", containerClassName)}>
			<Label className="text-sm font-medium">{label}</Label>
			<Input
				className={cn(error && "border-destructive", className)}
				{...props}
			/>
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
