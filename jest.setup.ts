import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from "util";

import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// jsdom does not provide these; some code under test (and undici) needs them.
if (typeof TextEncoder === "undefined") {
  global.TextEncoder = NodeTextEncoder as typeof global.TextEncoder;
  global.TextDecoder = NodeTextDecoder as typeof global.TextDecoder;
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

// jsdom implements neither the Pointer Capture API nor scrollIntoView, both of which Radix (desact
// Select, Dropdown, Dialog) calls when a listbox opens. Without these, any test that opens one dies
// with "target.hasPointerCapture is not a function".
Object.assign(Element.prototype, {
  hasPointerCapture: Element.prototype.hasPointerCapture ?? (() => false),
  setPointerCapture: Element.prototype.setPointerCapture ?? (() => {
  }),
  releasePointerCapture: Element.prototype.releasePointerCapture ?? (() => {
  }),
  scrollIntoView: Element.prototype.scrollIntoView ?? (() => {
  }),
});

configure({
  testIdAttribute: "data-test",
});
