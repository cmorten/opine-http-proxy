function connectionResetHandler(err: any, res: any) {
  res.set("X-Timeout-Reason", "opine-http-proxy reset the request.");
  res.sendStatus(504);
}

export function handleProxyErrors(err: any, res: any, next: any) {
  if (err && err.code === "ECONNRESET" || err.code === "ECONTIMEDOUT") {
    return connectionResetHandler(err, res);
  }

  next(err);
}
