const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "covid19India.db");
let db = null;

const convertdistricts = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

const convertstates = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const initializedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializedb();

//allstatesfromstatetable
app.get("/states/", async (request, response) => {
  const allstatesquery = `select * from state;`;
  const allstatesarray = await db.all(allstatesquery);
  response.send(allstatesarray.map((each) => convertstates(each)));
});

//stateonstateid
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateonstateidquery = `select * from state where state_id=${stateId};`;
  const state = await db.get(stateonstateidquery);
  response.send(convertstates(state));
});

//postdistrict
app.post("/districts/", async (request, response) => {
  const districtdetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtdetails;
  const districtpostquery = `INSERT INTO district (district_name,
    state_id,
    cases,
    cured,
    active,
    deaths) VALUES ('${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths});`;
  await db.run(districtpostquery);
  response.send("District Successfully Added");
});

//getdistrictonid
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtonidquery = `select * from district where district_id=${districtId};`;
  const district = await db.get(districtonidquery);
  response.send(convertdistricts(district));
});

//delete district
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deletedistrictquery = `DELETE from district where district_id=${districtId};`;
  await db.run(deletedistrictquery);
  response.send("District Removed");
});

//update district
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtdetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtdetails;
  const updatedistrictquery = `UPDATE district
  SET district_name='${districtName}',
    state_id=${stateId},
   cases= ${cases},
   cured= ${cured},
   active= ${active},
   deaths= ${deaths} where district_id=${districtId};`;
  await db.run(updatedistrictquery);
  response.send("District Details Updated");
});
