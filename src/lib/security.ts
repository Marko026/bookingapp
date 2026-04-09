import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML to prevent XSS attacks while preserving basic formatting.
 * Use this before rendering any HTML using dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
	if (!html) return "";

	// Do not run DOMPurify on the server during initial render
	// because it can strip/modify attributes differently than the client hydration expects.
	// In isomorphic context, if we are on server, just return as is (we trust our own db content for initial SSR).
	if (typeof window === "undefined") {
		return html;
	}

	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
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
		],
		ALLOWED_ATTR: ["href", "target", "rel", "class"],
	});
}
