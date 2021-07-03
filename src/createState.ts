// deno-lint-ignore-file no-explicit-any
import { ProxyOptions, resolveOptions } from "./resolveOptions.ts";

export interface ProxyUrlFunction<Req = any> {
  (req: Req): string | URL;
}

interface ProxyParams<
  Req = any,
  ProxyUrl = string | URL | ProxyUrlFunction<Req>,
  Opts = ProxyOptions,
> {
  url: ProxyUrl;
  options: Opts;
}

interface Source<Req = any, Res = any, Next = any> {
  req: Req;
  res: Res;
  next: Next;
}

interface Proxy {
  req?: Request;
  res?: Response;
  resData?: any;
  reqInit: RequestInit;
  url?: URL;
}

export interface ProxyState<
  Req = any,
  Res = any,
  Next = any,
  ProxyUrl = string | URL | ProxyUrlFunction<Req>,
  Opts = ProxyOptions,
> {
  src: Source<Req, Res, Next>;
  proxy: Proxy;
  options: ProxyOptions;
  params: ProxyParams<Req, ProxyUrl, Opts>;
}

export function createState<
  Req = any,
  Res = any,
  Next = any,
  ProxyUrl = string | URL | ProxyUrlFunction<Req>,
  Opts = ProxyOptions,
>(
  req: Req,
  res: Res,
  next: Next,
  url: ProxyUrl,
  options: Opts,
): ProxyState<Req, Res, Next, ProxyUrl, Opts> {
  return {
    src: {
      req,
      res,
      next,
    },
    proxy: {
      req: undefined,
      res: undefined,
      resData: undefined,
      reqInit: {},
      url: undefined,
    },
    options: resolveOptions(options),
    params: {
      url,
      options,
    },
  };
}
