import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.ComponentProps<typeof Input> {
	label: string;
	error?: string;
	containerClassName?: string;
	suffix?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	({ label, error, containerClassName, className, suffix, ...props }, ref) => {
		return (
			<div className={cn("space-y-2", containerClassName)}>
				<Label className="text-sm font-medium">{label}</Label>
				<div className="relative">
					<Input
						ref={ref}
						className={cn(
							error && "border-destructive",
							suffix && "pr-12",
							className,
						)}
						{...props}
					/>
					{suffix && (
						<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
							{suffix}
						</span>
					)}
				</div>
				{error && <p className="text-xs text-destructive">{error}</p>}
			</div>
		);
	},
);

FormInput.displayName = "FormInput";
