const axios = require("axios");

const launches = require("./launches.mongo.js");
const planets = require("./planets.mongo.js");

const SPACE_X_API_URI = "https://api.spacexdata.com/v5/launches/query";

async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, { __v: 0, _id: 0 })
    .sort({ flightNumber: 1 }) // 1 - ASC; -1 - DESC
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber"); // - DESC order

  return latestLaunch.flightNumber ?? DEFAULT_FLIGHT_NUMBER;
}

async function addNewLaunch(launch) {
  const planet = await planets.find({ keplerName: launch.target });

  if (!planet) {
    throw new Error("No matching planed found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    flightNumber: newFlightNumber,
    customers: ["Zero To Mastery", "NASA"],
  });
  await saveLaunch(newLaunch);
}

async function saveLaunch(launch) {
  try {
    await launches.findOneAndUpdate(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      { upsert: true }
    );
  } catch (err) {
    console.log(`Failed save launch: ${err}`);
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function getLaunchById(launchId) {
  return findLaunch({ flightNumber: launchId });
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );

  return aborted.modifiedCount === 1;
}

async function populateLaunches() {
  const response = await axios.post(SPACE_X_API_URI, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");

    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => payload.customers);

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      customers: customers,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch date already loaded");
  } else {
    await populateLaunches();
  }
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  getLaunchById,
  abortLaunchById,
  addNewLaunch,
};
