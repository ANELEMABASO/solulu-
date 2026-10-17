const UNAVAILABLE =
  'Email is not available in this online demo yet. It only works when the app is run locally.';

// Hosted builds have no email endpoints, so those requests return an HTML 404 page instead of JSON.
export async function readJson<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: UNAVAILABLE } as T;
  }
}
