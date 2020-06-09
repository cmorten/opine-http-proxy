import { ProxyState } from "../createState.ts";
import { asBuffer } from "../requestOptions.ts";
import {
  Request as OpineRequest,
  Response as OpineResponse,
} from "../../deps.ts";

const defaultDecorator = (
  _req: OpineRequest,
  _res: OpineResponse,
  _proxyRes: Response,
  proxyResData: any,
) => proxyResData;

export function decorateSrcRes(state: ProxyState) {
  const resolverFn = state.options.srcResDecorator || defaultDecorator;

  const req = state.src.req;
  const res = state.src.res;
  const proxyRes = state.proxy.res;
  const proxyResData = state.proxy.resData;

  if (res.status === 304) {
    return Promise.resolve(state);
  }

  return Promise
    .resolve(resolverFn(req, res, proxyRes as Response, proxyResData))
    .then((resolvedResData) => {
      state.proxy.resData = asBuffer(resolvedResData);

      return state;
    });
}
