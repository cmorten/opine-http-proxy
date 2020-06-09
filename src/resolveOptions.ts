import {
  Request as OpineRequest,
  Response as OpineResponse,
  NextFunction,
} from "../deps.ts";
import { isUnset } from "./isUnset.ts";

export interface ProxyOptions
  extends Omit<RequestInit, "body" | "window" | "method"> {
  /**
   * The filter option can be used to limit what requests are proxied.
   * Return false to continue to execute proxy; return true to skip proxy for this request.
   */
  filterReq?: (
    req: OpineRequest,
    res: OpineResponse,
  ) => boolean | Promise<boolean>;

  proxyErrorHandler?: (
    err: any,
    res: OpineResponse,
    next: NextFunction,
  ) => any;

  proxyReqUrlDecorator?: (url: URL, req?: OpineRequest) => URL | Promise<URL>;

  proxyReqPathDecorator?: (req?: OpineRequest) => string | Promise<string>;

  proxyReqInitDecorator?: (
    proxyReqOpts: RequestInit,
    srcReq: OpineRequest,
  ) => RequestInit | Promise<RequestInit>;

  srcResHeaderDecorator?: (
    headers: Headers,
    srcReq: OpineRequest,
    srcRes: OpineResponse,
    proxyReq: Request,
    proxyRes: Response,
  ) => Headers;

  srcResDecorator?: (
    srcReq: OpineRequest,
    srcRes: OpineResponse,
    proxyRes: Response,
    proxyResData: any,
  ) => any;

  filterRes?: (proxyRes: Response, proxyResData: any) => boolean;

  preserveHostHeader?: boolean;

  parseReqBody?: boolean;

  reqBodyEncoding?: "utf-8" | null;

  reqAsBuffer?: boolean;

  memoizeUrl?: boolean;

  memoizedUrl?: URL;

  secure?: boolean;

  port?: number;

  timeout?: number;

  method?: "string";
}

function resolveBodyEncoding(reqBodyEncoding: "utf-8" | null | undefined) {
  return reqBodyEncoding !== undefined ? reqBodyEncoding : "utf-8";
}

export function resolveOptions(options: ProxyOptions = {}): ProxyOptions {
  return {
    filterReq: options.filterReq,
    proxyErrorHandler: options.proxyErrorHandler,
    proxyReqUrlDecorator: options.proxyReqUrlDecorator,
    proxyReqPathDecorator: options.proxyReqPathDecorator,
    proxyReqInitDecorator: options.proxyReqInitDecorator,
    srcResHeaderDecorator: options.srcResHeaderDecorator,
    srcResDecorator: options.srcResDecorator,
    filterRes: options.filterRes,
    preserveHostHeader: options.preserveHostHeader,
    parseReqBody: isUnset(options.parseReqBody) ? true : options.parseReqBody,
    reqBodyEncoding: resolveBodyEncoding(options.reqBodyEncoding),
    memoizeUrl: isUnset(options.memoizeUrl) ? true : options.memoizeUrl,
    secure: options.secure,
    headers: options.headers,
    port: options.port,
    timeout: options.timeout,
  };
}
