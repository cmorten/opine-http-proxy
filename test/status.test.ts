import { describe, it } from "./support/utils.ts";
import { expect, opine, superdeno } from "./deps.ts";
import { proxy } from "../mod.ts";

describe("proxies status code", () => {
  [304, 404, 200, 401, 500].forEach((status) => {
    it(`should handle a "${status}" proxied status code`, (done) => {
      const target = opine();

      target.use("/status/:status", (req, res) => {
        res.sendStatus(parseInt(req.params.status));
      });

      const targetServer = target.listen();
      const targetPort = (targetServer.listener.addr as Deno.NetAddr).port;

      const proxyServer = opine();
      proxyServer.use(proxy(`http://localhost:${targetPort}`));

      superdeno(proxyServer)
        .get(`/status/${status}`)
        .end((err, res) => {
          targetServer.close();
          expect(res.status).toEqual(status);
          done();
        });
    });
  });
});
