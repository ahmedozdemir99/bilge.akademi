import { onRequest } from '../functions/api/[[path]]';

type SitesEnvironment = Parameters<typeof onRequest>[0]['env'] & {
  ASSETS: { fetch(request: Request): Promise<Response> };
};

export default {
  fetch(request: Request, env: SitesEnvironment): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return onRequest({ request, env, params: {} });
    }
    return env.ASSETS.fetch(request);
  },
};
