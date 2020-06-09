import { Response, NextFunction } from "../../deps.ts";

function connectionResetHandler(err: any, res: Response) {
  console.log("connectionResetHandler");
  res.set("X-Timeout-Reason", "opine-http-proxy reset the request.");
  res.sendStatus(504);
}

export function handleProxyErrors(err: any, res: Response, next: NextFunction) {
  if (err && err.code === "ECONNRESET" || err.code === "ECONTIMEDOUT") {
    return connectionResetHandler(err, res);
  }

  console.log("handleProxyErrors next");
  next(err);
}
