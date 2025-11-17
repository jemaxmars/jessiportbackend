const log = (level, message, error = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (level === "error" && error) {
    console.error(logMessage, error);
  } else {
    console.log(logMessage);
  }
};

export const logger = {
  info: (message) => log("INFO", message),
  error: (message, error) => log("ERROR", message, error),
  warn: (message) => log("WARN", message),
  debug: (message) => log("DEBUG", message),
};

export default logger;
