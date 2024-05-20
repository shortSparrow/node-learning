const express = require("express");
const { v4 } = require("uuid");
const PORT = 8000;

const app = express();

const jobs = {};

const runExpensiveJob = (jobId) => {
  const intervalId = setInterval(() => {
    jobs[jobId].progress += 10;
    if (jobs[jobId].progress === 100) {
      jobs[jobId].isFinished = true;
      clearInterval(intervalId);
    }
  }, 1000);
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

app.get("/check-status", (req, res) => {
  const currentJob = jobs[req.query.jobId];
  if (!currentJob) {
    return res.status(404).send("Task not found");
  }

  if (currentJob.isFinished === true) {
    return res.send("Task finished!");
  }

  return res.send(`Task in progress: ${currentJob.progress}%`);
});

app.listen(PORT, () => {
  console.log(`Listen on: ${PORT}`);
});
