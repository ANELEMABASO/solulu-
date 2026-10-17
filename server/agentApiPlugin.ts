import type { Plugin } from 'vite';
import { handleAgentRequest } from './agent/handler.ts';
import { handleDraftsRequest } from './draftsApi.ts';

export function agentApiPlugin(): Plugin {
  return {
    name: 'solulu-agent-api',
    configureServer(server) {
      server.middlewares.use('/api/drafts', (req, res) => {
        void handleDraftsRequest(req, res);
      });
      server.middlewares.use('/api/agent', (req, res) => {
        void handleAgentRequest(req, res);
      });
    },
  };
}
