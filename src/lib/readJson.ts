const UNAVAILABLE =
  'Email is not available in this online demo yet. It only works when the app is run locally.';

// Hosted builds have no email endpoints, so those requests return an HTML 404 page instead of JSON.
export async function readJson<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (response.status === 404) return { error: UNAVAILABLE } as T;
    const detail = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
    return { error: `Server error ${response.status}${detail ? `: ${detail}` : ''}` } as T;
  }
}
