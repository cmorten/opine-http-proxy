import type { ProxyState } from "../createState.ts";

const defaultDecorator = (url: URL): URL => url;

export function decorateProxyReqUrl(state: ProxyState) {
  const resolverFn = state.options.proxyReqUrlDecorator || defaultDecorator;

  return Promise
    .resolve(resolverFn(state.proxy.url as URL, state.src.req))
    .then((resolvedUrl) => {
      state.proxy.url = resolvedUrl;

      return state;
    });
}
