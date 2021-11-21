import { opine } from "https://deno.land/x/opine@1.9.1/mod.ts";
import { proxy } from "./mod.ts";

// const archiveURL =
//   "https://github.com/asos-craigmorten/opine/archive/refs/tags/1.9.1.zip";

const app = opine();

app.get(
  "/archive.zip",
  proxy("https://github.com", {
    proxyReqUrlDecorator(url) {
      url.pathname = "/asos-craigmorten/opine/archive/refs/tags/1.9.1.zip";
      return url;
    },
  }),
);

app.listen(3000, () => console.log("listening on 3000"));
