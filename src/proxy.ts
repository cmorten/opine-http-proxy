import { Request, Response, NextFunction } from "../deps.ts";
import { ProxyOptions } from "./resolveOptions.ts";
import { createState, ProxyUrlFunction } from "./createState.ts";
import { filterSrcReq } from "./steps/filterSrcReq.ts";
import { buildProxyUrl } from "./steps/buildProxyUrl.ts";
import { decorateProxyReqUrl } from "./steps/decorateProxyReqUrl.ts";
import { buildProxyReqInit } from "./steps/buildProxyReqInit.ts";
import { decorateProxyReqInit } from "./steps/decorateProxyReqInit.ts";
import { prepareProxyReq } from "./steps/prepareProxyReq.ts";
import { sendProxyReq } from "./steps/sendProxyReq.ts";
import { filterProxyRes } from "./steps/filterProxyRes.ts";
import { copyProxyResHeadersToUserRes } from "./steps/copyProxyResHeadersToUserRes.ts";
import { decorateSrcResHeaders } from "./steps/decorateSrcResHeaders.ts";
import { decorateSrcRes } from "./steps/decorateSrcRes.ts";
import { sendSrcRes } from "./steps/sendSrcRes.ts";
import { handleProxyErrors } from "./steps/handleProxyErrors.ts";

export function proxy(
  url: string | URL | ProxyUrlFunction,
  options: ProxyOptions = {},
) {
  return function handleProxy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const state = createState(req, res, next, url, options);

    return filterSrcReq(state)
      .then(buildProxyUrl)
      .then(decorateProxyReqUrl)
      .then(buildProxyReqInit)
      .then(decorateProxyReqInit)
      .then(prepareProxyReq)
      .then(sendProxyReq)
      .then(filterProxyRes)
      .then(copyProxyResHeadersToUserRes)
      .then(decorateSrcResHeaders)
      .then(decorateSrcRes)
      .then(sendSrcRes)
      .catch((err) => {
        if (err) {
          const resolver = (state.options.proxyErrorHandler)
            ? state.options.proxyErrorHandler
            : handleProxyErrors;

          resolver(err, res, next);
        } else {
          next();
        }
      });
  };
}
