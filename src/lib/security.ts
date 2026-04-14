import "server-only";

/**
 * Allowed HTML tags for sanitization (Tiptap editor output).
 * This runs ONLY on the server (in page.tsx Server Components).
 */
const ALLOWED_TAGS = new Set([
	"p",
	"b",
	"i",
	"em",
	"strong",
	"a",
	"ul",
	"ol",
	"li",
	"br",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"blockquote",
	"span",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
	a: new Set(["href", "target", "rel"]),
	"*": new Set(["class"]),
};

/**
 * Lightweight server-only HTML sanitizer.
 * Strips tags not in the allowlist and removes dangerous attributes.
 * Since this runs only on the server and the result is passed as a
 * serialized prop to the client, server and client HTML always match 1:1.
 *
 * This eliminates the need for isomorphic-dompurify (which crashes
 * Turbopack due to jsdom CSS file resolution) and removes all
 * hydration mismatch risks from HTML sanitization.
 */
export function sanitizeHtml(html: string): string {
	if (!html) return "";

	// Process all HTML tags
	return html.replace(
		/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\s*\/?>/g,
		(match, tagName: string, attrs: string | undefined) => {
			const tag = tagName.toLowerCase();

			// Closing tag
			if (match.startsWith("</")) {
				return ALLOWED_TAGS.has(tag) ? `</${tag}>` : "";
			}

			// Not an allowed tag — strip it
			if (!ALLOWED_TAGS.has(tag)) {
				return "";
			}

			// Self-closing (e.g. <br />, <br>)
			const isSelfClosing = tag === "br";

			// Filter attributes
			const cleanAttrs = sanitizeAttributes(tag, attrs || "");

			if (isSelfClosing) {
				return `<${tag}${cleanAttrs} />`;
			}

			return `<${tag}${cleanAttrs}>`;
		},
	);
}

function sanitizeAttributes(tag: string, attrString: string): string {
	if (!attrString.trim()) return "";

	const result: string[] = [];
	// Match attr="value", attr='value', or attr (boolean)
	const attrRegex =
		/([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
	let attrMatch: RegExpExecArray | null;

	while ((attrMatch = attrRegex.exec(attrString)) !== null) {
		const attrName = attrMatch[1].toLowerCase();
		const attrValue = attrMatch[2] ?? attrMatch[3] ?? "";

		// Check if this attribute is allowed for this tag or globally
		const tagAllowed = ALLOWED_ATTRS[tag];
		const globalAllowed = ALLOWED_ATTRS["*"];

		if (
			(tagAllowed && tagAllowed.has(attrName)) ||
			(globalAllowed && globalAllowed.has(attrName))
		) {
			// Block javascript: protocol in href
			if (
				attrName === "href" &&
				attrValue.replace(/\s/g, "").toLowerCase().startsWith("javascript:")
			) {
				continue;
			}
			result.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
		}
	}

	return result.length > 0 ? ` ${result.join(" ")}` : "";
}

function escapeAttrValue(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
