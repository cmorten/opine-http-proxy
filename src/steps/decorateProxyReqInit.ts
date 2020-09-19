import type { ProxyState } from "../createState.ts";

const defaultDecorator = (reqInit: RequestInit) => reqInit;

export function decorateProxyReqInit(state: ProxyState) {
  const resolverFn = state.options.proxyReqInitDecorator || defaultDecorator;

  return Promise
    .resolve(resolverFn(state.proxy.reqInit, state.src.req))
    .then((resolvedReqInit) => {
      state.proxy.reqInit = resolvedReqInit;

      return state;
    });
}
