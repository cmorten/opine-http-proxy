import type { ProxyState } from "../createState.ts";

const defaultDecorator = (headers: Headers): Headers => headers;

export function decorateSrcResHeaders(state: ProxyState) {
  const resolverFn = state.options.srcResHeaderDecorator || defaultDecorator;

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
