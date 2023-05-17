import httpProxy from "http-proxy";
import http, { IncomingMessage as Request, ServerResponse as Response } from "http";

export type PathMapperType = Record<string, string | { URL: string; rewriteURL?: boolean }>;
export type PathRegex = {
  regex: RegExp;
  target: string | { URL: string; rewriteURL?: boolean };
};

export class ReverseProxyPathMapper {
  private proxy: httpProxy<Request, Response>;
  private path_regex: PathRegex[] = [];

  constructor(proxyOptions: httpProxy.ServerOptions, pathMapper: PathMapperType) {
    this.proxy = httpProxy.createProxyServer<Request, Response>(proxyOptions);
    this.initProxyEvents();
    this.initPathRegex(pathMapper);
  }

  private initProxyEvents() {
    this.proxy.on("error", function (error, req, res) {
      console.log("Proxy Error:", error);
      return res.end("Error while connecting to proxy \n\n" + error.toString());
    });
  }

  private initPathRegex(pathMapper: PathMapperType) {
    const regexKeys = Object.keys(pathMapper);
    for (let key of regexKeys) {
      this.path_regex.push({ regex: new RegExp(key), target: pathMapper[key] });
    }
  }

  private matchURL(req: Request): string | undefined {
    for (const regex of this.path_regex) {
      if (req.url && regex.regex.test(req.url)) {
        if (typeof regex.target === "string") {
          return regex.target;
        }

        if (regex.target.rewriteURL) {
          req.url = "";
          return regex.target.URL;
        }

        return undefined;
      }
    }
  }

  private getTargetUrl(req: Request): { target: string; error?: string } {
    const target = this.matchURL(req);

    if (target) {
      return { target };
    }

    const errorMsg = `Path: ${req.url}  Did not matched.`;
    return { target: "", error: errorMsg };
  }

  serve(port: number) {
    const server = http.createServer((req, res) => {
      const { target, error } = this.getTargetUrl(req);

      if (error) {
        console.log(error);
        // Send res.end() with some message
        return res.end(error);
      }

      // forward proxy request
      return this.proxy.web(req, res, { target: target });
    });

    server.on("upgrade", (req, socket, head) => {
      const { target, error } = this.getTargetUrl(req);

      if (error) {
        return console.log(error);
      }
      // proxy ws request
      return this.proxy.ws(req, socket, head, { target: target });
    });

    server.listen(port, () => {
      console.log("Reverse Proxy listening on port " + port);
    });
  }
}
