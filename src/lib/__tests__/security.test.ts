import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sanitizeHtml } from "../security";

describe("sanitizeHtml", () => {
	it("passes through allowed tags unchanged", () => {
		const input = "<p>Hello <b>world</b></p>";
		expect(sanitizeHtml(input)).toBe(input);
	});

	it("strips disallowed tags but preserves text content", () => {
		const input = "<p>Hello <script>alert('xss')</script> world</p>";
		expect(sanitizeHtml(input)).toBe("<p>Hello alert('xss') world</p>");
	});

	it("strips dangerous attributes", () => {
		const input = '<p onclick="evil()">Hello</p>';
		expect(sanitizeHtml(input)).toBe("<p>Hello</p>");
	});

	it("allows href on anchor tags", () => {
		const input =
			'<a href="https://example.com" target="_blank" rel="noopener">Link</a>';
		expect(sanitizeHtml(input)).toBe(input);
	});

	it("blocks javascript: protocol in href", () => {
		const input = '<a href="javascript:alert(1)">Bad</a>';
		expect(sanitizeHtml(input)).toBe("<a>Bad</a>");
	});

	it("handles self-closing br tags", () => {
		expect(sanitizeHtml("<br />")).toBe("<br />");
		expect(sanitizeHtml("<br>")).toBe("<br />");
	});

	it("returns empty string for empty input", () => {
		expect(sanitizeHtml("")).toBe("");
		expect(sanitizeHtml(null as unknown as string)).toBe("");
	});

	it("strips img tags completely", () => {
		const input =
			'<p>Before <img src="evil.png" onerror="alert(1)" /> After</p>';
		expect(sanitizeHtml(input)).toBe("<p>Before  After</p>");
	});

	it("preserves heading tags", () => {
		const input = "<h1>Title</h1><h2>Subtitle</h2>";
		expect(sanitizeHtml(input)).toBe(input);
	});

	it("handles nested allowed tags", () => {
		const input = "<p><strong><em>Bold and italic</em></strong></p>";
		expect(sanitizeHtml(input)).toBe(input);
	});
});
