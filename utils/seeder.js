const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
// Load env vars
dotenv.config();

// Load models
const ChargingStation = require('../models/ChargingStation');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const stations = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/stations.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await ChargingStation.create(stations);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await ChargingStation.deleteMany(); // Deletes everything
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Check for command line arguments
if (process.argv[2] === '-i') {
  // node utils/seeder.js -i
  importData();
} else if (process.argv[2] === '-d') {
  // node utils/seeder.js -d
  deleteData();
}