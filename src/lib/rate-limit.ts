const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

const defaultConfig: RateLimitConfig = {
	maxRequests: 5,
	windowMs: 60_000, // 1 minute
};

export function checkRateLimit(
	key: string,
	config: Partial<RateLimitConfig> = {},
): { allowed: boolean; remaining: number } {
	const { maxRequests, windowMs } = { ...defaultConfig, ...config };
	const now = Date.now();
	const entry = rateLimitMap.get(key);

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, remaining: maxRequests - 1 };
	}

	if (entry.count >= maxRequests) {
		return { allowed: false, remaining: 0 };
	}

	entry.count++;
	return { allowed: true, remaining: maxRequests - entry.count };
}

export function clearExpiredEntries() {
	const now = Date.now();
	for (const [key, value] of rateLimitMap.entries()) {
		if (now > value.resetAt) {
			rateLimitMap.delete(key);
		}
	}
}

export function clearRateLimit(key: string) {
	rateLimitMap.delete(key);
}
