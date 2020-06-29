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

/**
 * Takes a url argument that can be a string, URL or a function
 * that returns one of the previous to proxy requests to. The
 * remaining path from a request that has not been matched by
 * Opine will be appended to the provided url when making the
 * proxy request.
 * 
 * Also accepts optional options configuration allowing the user
 * to modified all aspects of proxied request via option
 * properties or a series of hooks allowing decoration of the
 * outbound request and the inbound response objects.
 * 
 * Requests and responses can also be filtered via the `filterReq`
 * and `filterRes` function options, allowing requests to bypass
 * the proxy. Internally this is achieved by calling the Opine
 * `next()` method to delegate to the next Opine middleware.
 * 
 * @param {string|URL|ProxyUrlFunction} url
 * @param {ProxyOptions} options 
 * 
 * @returns {Function} Opine proxy middleware
 * @public
 */
export function proxy(
  url: string | URL | ProxyUrlFunction,
  options: ProxyOptions = {},
) {
  return function handleProxy(
    req: any,
    res: any,
    next: any,
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
