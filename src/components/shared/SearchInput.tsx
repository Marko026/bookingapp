import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder,
	className,
}: SearchInputProps) {
	return (
		<div className={`relative flex-1 md:w-72 ${className}`}>
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
			<Input
				placeholder={placeholder}
				className="pl-10 rounded-xl"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
