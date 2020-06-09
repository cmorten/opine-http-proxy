import { ProxyState } from "../createState.ts";

const defaultDecorator = (): boolean => false;

export function filterProxyRes(state: ProxyState) {
  const resolverFn = state.options.filterRes || defaultDecorator;

  return Promise
    .resolve(
      resolverFn(state.proxy.res as Response, state.proxy.resData as any),
    )
    .then((isFiltered) => {
      if (isFiltered) {
        (state.src.res as any).opineHttpProxy = state.proxy;

        return Promise.reject();
      }

      return Promise.resolve(state);
    });
}
