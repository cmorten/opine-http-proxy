import { describe, it } from "./support/utils.ts";
import { superdeno, opine, expect } from "./deps.ts";
import { proxy } from "../mod.ts";

const STATUS_CODES = [
  {
    code: 403,
    text: "Forbidden",
    toString: /Error\: cannot GET http\:\/\/127.0.0.1\:\d+\/proxy \(403\)/,
  },
  {
    code: 404,
    text: "Not Found",
    toString: /Error\: cannot GET http\:\/\/127.0.0.1\:\d+\/proxy \(404\)/,
  },
  {
    code: 500,
    text: "Internal Server Error",
    toString: /Error\: cannot GET http\:\/\/127\.0\.0\.1\:\d+\/proxy \(500\)/,
  },
];

describe("when server responds with an error", () => {
  STATUS_CODES.forEach((statusCode) => {
    it(`opine-http-proxy responds with ${statusCode.text} when proxy server responds ${statusCode.code}`, (
      done,
    ) => {
      const app = opine();

      const target = opine();
      target.use(function (req, res) {
        res.sendStatus(statusCode.code);
      });
      const targetServer = target.listen(0);
      const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;

      app.use(
        "/proxy",
        proxy(`http://127.0.0.1:${targetPort}`, {
          reqAsBuffer: true,
          reqBodyEncoding: null,
          parseReqBody: false,
        }),
      );

      superdeno(app)
        .get("/proxy")
        .end((err, res) => {
          targetServer.close();
          expect(res.status).toEqual(statusCode.code);
          expect(res.text).toEqual(statusCode.text);
          expect(res.error).toBeDefined();
          expect(res.error.toString()).toMatch(statusCode.toString);
          done();
        });
    });
  });
});
