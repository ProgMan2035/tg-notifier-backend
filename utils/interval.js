export function intervalRequest(s, condition, callback) {
  let counter = Math.max(s | 0, 0);

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      if (condition()) {
        resolve(callback());
        clearInterval(intervalId);
      }

      if (!counter) {
        resolve();
        clearInterval(intervalId);
      }

      counter -= 1;
    }, 1000);
  });
}
