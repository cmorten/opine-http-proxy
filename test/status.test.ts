import { describe, it } from "./support/utils.ts";
import { superdeno, opine, expect } from "./deps.ts";
import { proxy } from "../mod.ts";

describe("proxies status code", () => {
  const mockEndpointPort = 21239;
  const proxyServer = opine();
  proxyServer.use(proxy(`http://localhost:${mockEndpointPort}`));

  [304, 404, 200, 401, 500].forEach((status) => {
    it(`should handle a "${status}" proxied status code`, (done) => {
      const mockEndpoint = opine();

      mockEndpoint.use("/status/:status", (req, res) => {
        res.sendStatus(parseInt(req.params.status));
      });

      const server = mockEndpoint.listen(mockEndpointPort);

      superdeno(proxyServer)
        .get(`/status/${status}`)
        .end((_err, res) => {
          server.close();
          expect(res.status).toEqual(status);
          done();
        });
    });
  });
});
