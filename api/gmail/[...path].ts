import { handleGmailRequest } from '../../server/gmailApiPlugin.ts';

export default function gmail(req: Parameters<typeof handleGmailRequest>[0], res: Parameters<typeof handleGmailRequest>[1]) {
  return handleGmailRequest(req, res, true);
}
