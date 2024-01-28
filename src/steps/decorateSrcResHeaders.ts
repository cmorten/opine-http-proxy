import type { ProxyState } from "../createState.ts";

export function decorateSrcResHeaders(state: ProxyState) {
  const resolverFn = state.options.srcResHeaderDecorator;

  if (!resolverFn) {
    return Promise.resolve(state);
  }

  const headers = state.src.res.headers || new Headers();

  return Promise
    .resolve(
      resolverFn(
        headers,
        state.src.req,
        state.src.res,
        state.proxy.req as Request,
        state.proxy.res as Response,
      ),
    )
    .then((resolvedHeaders) => {
      state.src.res.headers = resolvedHeaders;

      return state;
    });
}
