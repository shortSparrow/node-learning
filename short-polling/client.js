const http = require("http");

const sendRequestAndRunPolling = () => {
  const requestSubmit = http.request({
    host: "localhost",
    port: "8000",
    method: "POST",
    path: "/submit",
  });

  requestSubmit.on("response", (response) => {
    response.on("data", (chunk) => {
      const jobId = chunk.toString();
      console.log("client jobId: ", jobId);

      const intervalId = setInterval(() => {
        const requestCheck = http.request({
          host: "localhost",
          port: "8000",
          method: "GET",
          path: `/check-status?jobId=${jobId}`,
        });

        requestCheck.on("response", (resp) => {
          resp.on("data", (data) => {
            const parsedData = data.toString();
            console.log(`JonId - ${jobId} data: `, parsedData);
            if (parsedData === "Task finished!") {
              clearInterval(intervalId);
            }
          });
        });
        requestCheck.end();
      }, 500);
    });
  });

  requestSubmit.end();
};


sendRequestAndRunPolling()
setTimeout(() => sendRequestAndRunPolling(), 1000)
setTimeout(() => sendRequestAndRunPolling(), 3000)