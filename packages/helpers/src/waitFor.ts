
export const waitFor = (check: () => boolean, timeout: number) =>
  new Promise<void>((resolve, reject) => {
    // If we haven't had any result after timeout
    // We should stop checking and tell the caller
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      reject();
    }, timeout);

    // Check every 200ms if we are done waiting
    // If we are done, stop the interval and timer
    const intervalId = window.setInterval(() => {
      const isTrue = check();
      if (isTrue) {
        window.clearInterval(intervalId);
        window.clearTimeout(timeoutId);
        resolve();
      }
    }, 200);
  });