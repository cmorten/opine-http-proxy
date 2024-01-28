// deno-lint-ignore-file no-explicit-any
import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { expect, opine } from "./deps.ts";
import { proxy, ProxyOptions } from "../mod.ts";

function chunkingProxyServer() {
  const proxyRouteFn = [{
    method: "get",
    path: "/stream",
    fn: function (_req: any, res: any) {
      let timer: number | undefined = undefined;
      let counter = 0;

      const body = new ReadableStream({
        start(controller) {
          timer = setInterval(() => {
            if (counter > 3) {
              clearInterval(timer);
              controller.close();

              return;
            }

            const message = `${counter}`;
            controller.enqueue(new TextEncoder().encode(message));
            counter++;
          }, 50);
        },

        cancel() {
          if (timer !== undefined) {
            clearInterval(timer);
          }
        },
      });

      res.end(body);
    },
  }];

  return proxyTarget({ port: 8309, timeout: 1000, handlers: proxyRouteFn });
}

const decoder = new TextDecoder();

async function simulateUserRequest() {
  const response = await fetch("http://localhost:8308/stream");
  const chunks = [];

  for await (const chunk of response.body!) {
    const decodedChunk = decoder.decode(chunk);
    chunks.push(decodedChunk);
  }

  return chunks;
}

function startLocalServer(proxyOptions: ProxyOptions) {
  const app = opine();

  app.get("/stream", proxy("http://localhost:8309", proxyOptions));

  return app.listen(8308);
}

describe("streams / piped requests", function () {
  describe("when streaming options are truthy", function () {
    const TEST_CASES = [{
      name: "vanilla, no options defined",
      options: {},
    }, {
      name: "proxyReqOptDecorator is defined",
      options: {
        proxyReqInitDecorator: function (reqInit: any) {
          return reqInit;
        },
      },
    }, {
      name: "proxyReqOptDecorator is a Promise",
      options: {
        proxyReqInitDecorator: function (reqInit: any) {
          return Promise.resolve(reqInit);
        },
      },
    }];

    TEST_CASES.forEach(function (testCase) {
      describe(testCase.name, function () {
        it(
          testCase.name +
            ": chunks are received without any buffering, e.g. before request end",
          function (done) {
            const targetServer = chunkingProxyServer();
            const server = startLocalServer(testCase.options);

            simulateUserRequest()
              .then(function (res) {
                expect(res instanceof Array).toBeTruthy();
                expect(res).toHaveLength(4);

                server.close();
                targetServer.close();
                done();
              })
              .catch((error) => {
                server.close();
                targetServer.close();

                done(error);
              });
          },
        );
      });
    });
  });

  describe("when streaming options are falsy", function () {
    const TEST_CASES = [{
      name: "filterRes is defined",
      options: {
        filterRes: function () {
          return false;
        },
      },
    }];

    TEST_CASES.forEach(function (testCase) {
      describe(testCase.name, function () {
        it("response arrives in one large chunk", function (done) {
          const targetServer = chunkingProxyServer();
          const server = startLocalServer(testCase.options);

          simulateUserRequest()
            .then(function (res) {
              expect(res instanceof Array).toBeTruthy();
              expect(res).toHaveLength(1);

              server.close();
              targetServer.close();
              done();
            })
            .catch((error) => {
              server.close();
              targetServer.close();
              done(error);
            });
        });
      });
    });
  });
});
