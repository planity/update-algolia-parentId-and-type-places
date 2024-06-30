require('dotenv').config();
const algolia = require("algoliasearch");
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Define the environment (Lab or Staging)
const ENV = 'Lab'; // Options: 'Lab' or 'Staging'

const csvFilePath = path.resolve(__dirname, 'csv_data/department_locality_parents_places_de.csv');

const ALGOLIA_CONFIG = {
    Lab: {
      appId: process.env.ALGOLIA_LAB_APP_ID,
      apiKey: process.env.ALGOLIA_LAB_API_KEY
    },
    Staging: {
      appId: process.env.ALGOLIA_STAGING_APP_ID,
      apiKey: process.env.ALGOLIA_STAGING_API_KEY
    }
  };

// Initialize Algolia client and index
const { appId, apiKey } = ALGOLIA_CONFIG[ENV];
const client = algolia(appId, apiKey);
const index = client.initIndex("places");

const readCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath);
  const csvData = csvFile.toString();

  return new Promise((resolve) => {
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        console.log('Complete', results.data.length, 'records.');
        resolve(results.data);
      }
    });
  });
};

// Function to update Algolia with parent ID and type 'district'
const updateAlgoliaParentIdAndTypePlaces = async () => {
  try {
    const parsedData = await readCSV(csvFilePath);

    // Filter and map the data to the required format
    const objects = parsedData
      .filter(({ objectID, parentId }) => objectID && parentId) // Filter out invalid records
      .map(({ objectID, parentId }) => ({
        objectID,
        parentId,
        type: 'district'
      }));

      console.log("Objects to update:", objects);
    // Uncomment the lines below to update objects in Algolia
    // const response = await index.partialUpdateObjects(objects);
    // console.log('Updated object IDs:', response.objectIDs);
  } catch (error) {
    console.error('Error updating Algolia objects:', error);
  }
};

// Execute the update function
updateAlgoliaParentIdAndTypePlaces();
