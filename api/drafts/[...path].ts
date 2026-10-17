import { handleDraftsRequest } from '../../server/draftsApi.ts';

export default function drafts(req: Parameters<typeof handleDraftsRequest>[0], res: Parameters<typeof handleDraftsRequest>[1]) {
  return handleDraftsRequest(req, res, true);
}
