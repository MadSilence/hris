import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

class ResizeObserverMock {
  observe() {
  }

  unobserve() {
  }

  disconnect() {
  }
}

Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

class IntersectionObserverMock {
  observe() {
  }

  unobserve() {
  }

  disconnect() {
  }
}

Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
    },
    removeListener: () => {
    },
    addEventListener: () => {
    },
    removeEventListener: () => {
    },
    dispatchEvent: () => false,
  }),
});

window.scrollTo = () => {
};

configure({
  testIdAttribute: "data-test",
});
