import { error } from '@sveltejs/kit';

// Utility type to pluck the generic T out of any .json() Promise
type InferJson<T> = T extends { json(): Promise<infer U> } ? U : never;

// Base interface just to ensure we're receiving a Response-like object
type BaseResponse = {
	ok: boolean;
	status: number;
	text(): Promise<string>;
	json(): Promise<unknown>;
};

export async function handleCrudLoad<T extends BaseResponse>(
	apiPromise: Promise<T>
): Promise<Exclude<InferJson<T>, { error: unknown }>> {
	const res = await apiPromise;

	if (!res.ok) {
		const errorText = await res.text();
		throw error(res.status, errorText);
	}

	const data = await res.json();

	if (data && typeof data === 'object' && 'error' in data) {
		throw error(400, (data as Record<string, unknown>).error as string);
	}

	// We cast the return type because we've handled/thrown the error branch above
	return data as Exclude<InferJson<T>, { error: unknown }>;
}