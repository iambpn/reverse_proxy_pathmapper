const { ReverseProxyPathMapper } = require("../dist/index");

const pathMapper = {
  "/8080/?(.*)": "http://localhost:8080", // value must not end with trailing slash
  "/8081/?(.*)": {
    URL: "http://localhost:8081",
    rewriteURL: false,
    // since rewriteURL is false proxy will append '/8081/<regex url>' to http://localhost:8081 -> Final URL: 'http://localhost:8081/8081/<regex url>'
  },
  "/8081/static": {
    URL: "http://localhost:8081",
    rewriteURL: true,
    // since rewriteURL is true proxy will not append '/8081/static' to http://localhost:8081 -> Final URL: http://localhost:8081
  },
};

new ReverseProxyPathMapper({}, pathMapper).serve(9000);
