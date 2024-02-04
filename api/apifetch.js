const { MongoClient, ServerApiVersion } = require('mongodb');

// Environment variables for MongoDB connection
const uri = process.env.MONGODB_URI;
const dbName = 'AISPECS';
const collectionName = 'Tasks';

// MongoDB Client setup
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function timeToSeconds(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(' ').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

module.exports = async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const tasks = await collection.find({}).toArray();

    let totalDifferences = {
      'No Detections': 0,
      'Book': 0,
      'Instagram': 0
    };

    tasks.forEach((task, i) => {
      if (i < tasks.length - 1 && tasks[i].Date === tasks[i + 1].Date) {
        const timeDiff = Math.abs(timeToSeconds(tasks[i].Time) - timeToSeconds(tasks[i + 1].Time));
        totalDifferences[task.Task] += timeDiff;
      }
    });

    res.json(totalDifferences);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error calculating time differences');
  } finally {
    await client.close();
  }
};
