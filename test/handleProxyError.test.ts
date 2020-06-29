import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { superdeno, opine, expect } from "./deps.ts";
import { proxy } from "../mod.ts";

const REMOTE_SERVER_LATENCY = 500;

const timeoutManager = {
  resolver: () => {},
  promise: Promise.resolve(),
  respond: true,
  reset() {
    this.respond = true;
    this.promise = new Promise((resolve) => {
      this.resolver = resolve;
    });
  },
  async close() {
    this.respond = false;
    return await this.end();
  },
  async end() {
    return await this.promise;
  },
};

const proxyRouteFn = [
  {
    method: "get",
    path: "/:errorCode",
    fn: async (req: any, res: any) => {
      setTimeout(() => {
        timeoutManager.resolver();

        if (timeoutManager.respond) {
          const errorCode = req.params.errorCode;

          if (errorCode === "timeout") {
            return res.setStatus(504).send("test-timeout");
          }

          res.setStatus(parseInt(errorCode)).send("test-case-error");
        }
      }, REMOTE_SERVER_LATENCY);
    },
  },
];

describe("error handling can be overridden by user", () => {
  describe("when user provides a null function", () => {
    describe("when a timeout is set that fires", () => {
      it("passes 504 directly to client", (done) => {
        timeoutManager.reset();
        const targetServer = proxyTarget({ handlers: proxyRouteFn });
        const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;

        const app = opine();
        app.use(proxy(`localhost:${targetPort}`, { timeout: 0 }));

        superdeno(app)
          .get("/200")
          .end(async (err, res) => {
            await timeoutManager.close();
            targetServer.close();
            expect(res.status).toEqual(504);
            expect(res.header["x-timeout-reason"]).toEqual(
              "opine-http-proxy reset the request.",
            );
            done();
          });
      });
    });

    describe("when a timeout is not set", () => {
      it("passes status code (e.g. 504) directly to the client", (done) => {
        timeoutManager.reset();
        const targetServer = proxyTarget({ handlers: proxyRouteFn });
        const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;

        const app = opine();
        app.use(proxy(`localhost:${targetPort}`));

        superdeno(app)
          .get("/504")
          .end(async (err, res) => {
            expect(res.status).toEqual(504);
            expect(res.text).toEqual("test-case-error");
            await timeoutManager.end();
            targetServer.close();
            done();
          });
      });

      it("passes status code (e.g. 500) back to the client", (done) => {
        timeoutManager.reset();
        const targetServer = proxyTarget({ handlers: proxyRouteFn });
        const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;

        const app = opine();
        app.use(proxy(`localhost:${targetPort}`));

        superdeno(app)
          .get("/500")
          .end(async (err, res) => {
            expect(res.status).toEqual(500);
            expect(res.text).toEqual("test-case-error");
            await timeoutManager.end();
            targetServer.close();
            done();
          });
      });
    });
  });

  describe("when user provides a handler function", () => {
    const statusCode = 418;
    const message =
      "Whoever you are, and wherever you may be, friendship is always granted over a good cup of tea.";

    describe("when a timeout is set that fires", () => {
      it("should use the provided handler function passing on the timeout error", (
        done,
      ) => {
        timeoutManager.reset();
        const targetServer = proxyTarget({ handlers: proxyRouteFn });
        const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;

        const app = opine();
        app.use(proxy(`localhost:${targetPort}`, {
          timeout: 1,
          proxyErrorHandler: (err, res, next) => {
            res.setStatus(statusCode).send(message);
          },
        }));

        superdeno(app)
          .get("/200")
          .end(async (err, res) => {
            await timeoutManager.close();
            targetServer.close();
            expect(res.status).toEqual(statusCode);
            expect(res.text).toEqual(message);
            done();
          });
      });
    });

    describe("when the remote server is down", () => {
      it("should use the provided handler function passing on the connection refused error", (
        done,
      ) => {
        const targetServer = proxyTarget({ handlers: proxyRouteFn });
        const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;
        targetServer.close();

        const app = opine();
        app.use(proxy(`localhost:${targetPort}`, {
          proxyErrorHandler: (err, res, next) => {
            res.setStatus(statusCode).send(message);
          },
        }));

        superdeno(app)
          .get("/200")
          .end((err, res) => {
            expect(res.status).toEqual(statusCode);
            expect(res.text).toEqual(message);
            done();
          });
      });
    });
  });
});
