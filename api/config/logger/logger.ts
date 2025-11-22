import pino from "pino";
import pinoPretty from "pino-pretty";

const stream = pinoPretty({
  colorize: true
});

const rootLogger = pino({
  level: "info",
  formatters: {
    level: (label) => ({
      level: label
    }),
  },
}, stream);

export const createLogger = (
  loggerName: string
) => {
  rootLogger.child({ name: loggerName });
};
