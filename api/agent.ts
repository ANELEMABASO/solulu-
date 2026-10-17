import { handleAgentRequest } from '../server/agent/handler.ts';

export default function agent(req: Parameters<typeof handleAgentRequest>[0], res: Parameters<typeof handleAgentRequest>[1]) {
  return handleAgentRequest(req, res, { allowDrafts: false });
}
