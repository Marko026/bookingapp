import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.ComponentProps<typeof Input> {
	label: string;
	error?: string;
	containerClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	({ label, error, containerClassName, className, ...props }, ref) => {
		return (
			<div className={cn("space-y-2", containerClassName)}>
				<Label className="text-sm font-medium">{label}</Label>
				<Input
					ref={ref}
					className={cn(error && "border-destructive", className)}
					{...props}
				/>
				{error && <p className="text-xs text-destructive">{error}</p>}
			</div>
		);
	},
);

FormInput.displayName = "FormInput";
