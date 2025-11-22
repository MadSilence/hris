import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

if (typeof TextEncoder === "undefined") {
  const {TextEncoder, TextDecoder} = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

configure({testIdAttribute: "data-test"});
