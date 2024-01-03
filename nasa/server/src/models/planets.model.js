const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

const isHabitablePlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "../../data/kepler_data.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // insert + update = upsert
          savePlanet(data);
        }
      })
      .on("error", (error) => {
        console.log("ERROR: ", error);
        reject(error);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}); // return all planets

  /**
   * First {} is filter params. If empty return all planets, in this case return only planets with name 'planet name'
   * Second {} show should we include field in result or not. 1 means YES, 0 means NO
   */
  // return planets.find({keplerName: 'planet name'}, { keplerName: 1 });

  // return planets.find({}, 'keplerName anotherField'); // return all planets and returned data mast contains 2 fields: keplerName and anotherField
  // return planets.find({}, '-keplerName anotherField'); // return all planets must exclude keplerName and contains  anotherField
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (err) {
    console.log(`Could not save planet: ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
