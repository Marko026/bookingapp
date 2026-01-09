"use client";

import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Italic,
	List,
	ListOrdered,
	Type,
	Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
	id?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	label?: string;
	error?: string;
}

const MenuButton = ({
	onClick,
	isActive,
	children,
	tooltip,
}: {
	onClick: () => void;
	isActive: boolean;
	children: React.ReactNode;
	tooltip: string;
}) => (
	<TooltipProvider delayDuration={400}>
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onClick}
					className={cn(
						"h-8 w-8 p-0 rounded-lg transition-all duration-200",
						isActive
							? "bg-amber-100 text-amber-900 border-amber-200"
							: "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
					)}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				className="bg-black text-white text-[10px] px-2 py-1 rounded-md border-none"
			>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

export function RichTextEditor({
	id,
	value,
	onChange,
	placeholder = "Napišite nešto...",
	className,
	label,
	error,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Placeholder.configure({
				placeholder,
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-stone max-w-none focus:outline-none min-h-[150px] px-4 py-3 text-gray-700 leading-relaxed",
					"prose-headings:font-serif prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-amber-900",
				),
			},
		},
		immediatelyRender: false,
	});

	if (!editor) return null;

	return (
		<div className={cn("space-y-2", className)}>
			{label && (
				<label className="text-sm font-medium text-gray-900">{label}</label>
			)}

			<div
				className={cn(
					"relative rounded-[1.5rem] border border-gray-100 bg-white transition-all duration-300 focus-within:border-amber-200 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden",
					error && "border-destructive focus-within:border-destructive",
				)}
			>
				{/* Luxury Glassmorphism Toolbar */}
				<div className="flex items-center gap-1 p-1.5 border-b border-gray-50 bg-gray-50/50 backdrop-blur-sm">
					<MenuButton
						onClick={() => editor.chain().focus().toggleBold().run()}
						isActive={editor.isActive("bold")}
						tooltip="Bold (Ctrl+B)"
					>
						<Bold size={16} />
					</MenuButton>

					<MenuButton
						onClick={() => editor.chain().focus().toggleItalic().run()}
						isActive={editor.isActive("italic")}
						tooltip="Italic (Ctrl+I)"
					>
						<Italic size={16} />
					</MenuButton>

					<MenuButton
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						isActive={editor.isActive("underline")}
						tooltip="Underline (Ctrl+U)"
					>
						<UnderlineIcon size={16} />
					</MenuButton>

					<div className="w-px h-4 bg-gray-200 mx-1" />

					<MenuButton
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						isActive={editor.isActive("bulletList")}
						tooltip="Bullet List"
					>
						<List size={16} />
					</MenuButton>

					<MenuButton
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						isActive={editor.isActive("orderedList")}
						tooltip="Ordered List"
					>
						<ListOrdered size={16} />
					</MenuButton>

					<div className="w-px h-4 bg-gray-200 mx-1" />

					<MenuButton
						onClick={() =>
							editor.chain().focus().clearNodes().unsetAllMarks().run()
						}
						isActive={false}
						tooltip="Clear Formatting"
					>
						<Type size={16} />
					</MenuButton>
				</div>

				<EditorContent editor={editor} />

				{/* Character Count or subtle hint could go here */}
			</div>

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
