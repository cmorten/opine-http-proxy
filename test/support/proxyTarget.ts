// deno-lint-ignore-file no-explicit-any
import { ErrorRequestHandler, json, opine, urlencoded } from "../deps.ts";

export function proxyTarget(
  { port = 0, timeout = 100, handlers }: {
    port?: number;
    timeout?: number;
    handlers?: any;
  } = { port: 0, timeout: 100 },
) {
  const target = opine();

  target.use(urlencoded());
  target.use(json());

  target.use(function (_req, _res, next) {
    setTimeout(function () {
      next();
    }, timeout);
  });

  if (handlers) {
    handlers.forEach((handler: any) => {
      (target as any)[handler.method](handler.path, handler.fn);
    });
  }

  target.get("/get", function (_req, res) {
    res.send("OK");
  });

  target.use("/headers", function (req, res) {
    res.json({ headers: req.headers });
  });

  target.use(
    (function (err, _req, res, next) {
      res.send(err);
      next();
    }) as ErrorRequestHandler,
  );

  target.use(function (_req, res) {
    res.sendStatus(404);
  });

  return target.listen(port);
}
