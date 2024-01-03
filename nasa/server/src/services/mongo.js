const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection is ready!");
});

mongoose.connection.on("error", (error) => {
  console.error(error);
});

async function connectMongoDb() {
  await mongoose.connect(MONGO_URL);
}

async function disconnectMongoDb() {
  await mongoose.disconnect();
}

module.exports = {
  connectMongoDb,
  disconnectMongoDb,
};
