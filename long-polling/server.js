const express = require("express");
const { v4 } = require("uuid");
const PORT = 8000;

const app = express();

const jobs = {};

const runExpensiveJob = (jobId) => {
  const intervalId = setInterval(() => {
    jobs[jobId].progress += 0.5;
    if (jobs[jobId].progress >= 100) {
      jobs[jobId].isFinished = true;
      clearInterval(intervalId);
    }
  }, 1000);
};

const checkIsJobDone = async (jobId) => {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const currentJob = jobs[jobId];
      console.log(`Task in progress: ${currentJob.progress}%`);
      if (currentJob.isFinished === true) {
        clearInterval(intervalId);
        resolve(currentJob);
      }
    }, 500);
  });
};

app.post("/submit", (req, res) => {
  const jobId = v4();
  jobs[jobId] = {
    isFinished: false,
    progress: 0,
  };
  runExpensiveJob(jobId);
  return res.send(jobId);
});

app.get("/check-status", async (req, res) => {
  if (!jobs[req.query.jobId]) {
    return res.status(404).send("Task not found");
  }
  const currentJob = await checkIsJobDone(req.query.jobId);
  console.log("currentJob: ", currentJob);
  if (currentJob.isFinished === true) {
    return res.send("Task finished!");
  }
});

app.listen(PORT, () => {
  console.log(`Listen on: ${PORT}`);
});
