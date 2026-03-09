const { MongoClient, ObjectId } = require('mongodb');

let db = null;
let client = null;

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('MONGODB_URI ou MONGO_URL manquant dans les variables d\'environnement');
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('sayuri');
  return db;
}

async function initDatabase() {
  if (!db) await connectDatabase();
  const couples = db.collection('couples');
  const divorces = db.collection('divorce_requests');
  await couples.createIndex({ user1_id: 1, user2_id: 1 }, { unique: true });
  await couples.createIndex({ channel_id: 1 }, { unique: true });
  await divorces.createIndex({ couple_id: 1 });
  await divorces.createIndex({ status: 1 });
}

async function getCoupleByUser(userId) {
  if (!db) await connectDatabase();
  return db.collection('couples').findOne({
    $or: [{ user1_id: userId }, { user2_id: userId }],
  });
}

async function getCoupleByChannel(channelId) {
  if (!db) await connectDatabase();
  return db.collection('couples').findOne({ channel_id: channelId });
}

async function getCoupleById(id) {
  if (!db) await connectDatabase();
  const _id = typeof id === 'string' ? new ObjectId(id) : id;
  return db.collection('couples').findOne({ _id });
}

async function createCouple(user1Id, user2Id, channelId) {
  if (!db) await connectDatabase();
  const doc = {
    user1_id: user1Id,
    user2_id: user2Id,
    channel_id: channelId,
    love_points: 0,
    weekly_points: 0,
    created_at: Date.now(),
  };
  const result = await db.collection('couples').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function addLovePoints(channelId, points = 1) {
  if (!db) await connectDatabase();
  await db.collection('couples').updateOne(
    { channel_id: channelId },
    { $inc: { love_points: points, weekly_points: points } }
  );
}

async function resetWeeklyPoints() {
  if (!db) await connectDatabase();
  await db.collection('couples').updateMany({}, { $set: { weekly_points: 0 } });
}

async function getLeaderboard(limit = 10) {
  if (!db) await connectDatabase();
  return db
    .collection('couples')
    .find({})
    .sort({ weekly_points: -1 })
    .limit(limit)
    .toArray();
}

async function getLeaderboardAllTime(limit = 10) {
  if (!db) await connectDatabase();
  return db
    .collection('couples')
    .find({})
    .sort({ love_points: -1 })
    .limit(limit)
    .toArray();
}

async function deleteCouple(coupleId) {
  if (!db) await connectDatabase();
  const _id = typeof coupleId === 'string' ? new ObjectId(coupleId) : coupleId;
  await db.collection('couples').deleteOne({ _id });
}

async function createDivorceRequest(coupleId, reason) {
  if (!db) await connectDatabase();
  const cid = typeof coupleId === 'object' && coupleId?.toString ? coupleId : new ObjectId(coupleId);
  const doc = {
    couple_id: cid,
    reason,
    status: 'pending',
    requested_at: Date.now(),
    processed_at: null,
  };
  const result = await db.collection('divorce_requests').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function getPendingDivorceRequests() {
  if (!db) await connectDatabase();
  const requests = await db
    .collection('divorce_requests')
    .aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'couples',
          localField: 'couple_id',
          foreignField: '_id',
          as: 'couple',
        },
      },
      { $unwind: '$couple' },
      {
        $project: {
          _id: 1,
          reason: 1,
          status: 1,
          requested_at: 1,
          user1_id: '$couple.user1_id',
          user2_id: '$couple.user2_id',
          channel_id: '$couple.channel_id',
          couple_id: 1,
        },
      },
    ])
    .toArray();
  return requests.map((r) => ({
    ...r,
    id: r._id.toString(),
    user1_id: r.user1_id,
    user2_id: r.user2_id,
  }));
}

async function getDivorceRequestById(id) {
  if (!db) await connectDatabase();
  const _id = new ObjectId(id);
  const request = await db
    .collection('divorce_requests')
    .aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: 'couples',
          localField: 'couple_id',
          foreignField: '_id',
          as: 'couple',
        },
      },
      { $unwind: '$couple' },
      {
        $project: {
          _id: 1,
          couple_id: 1,
          reason: 1,
          status: 1,
          user1_id: '$couple.user1_id',
          user2_id: '$couple.user2_id',
          channel_id: '$couple.channel_id',
        },
      },
    ])
    .next();
  return request ? { ...request, id: request._id.toString() } : null;
}

async function approveDivorce(requestId) {
  if (!db) await connectDatabase();
  const _id = new ObjectId(requestId);
  await db
    .collection('divorce_requests')
    .updateOne({ _id }, { $set: { status: 'approved', processed_at: Date.now() } });
}

async function rejectDivorce(requestId) {
  if (!db) await connectDatabase();
  const _id = new ObjectId(requestId);
  await db
    .collection('divorce_requests')
    .updateOne({ _id }, { $set: { status: 'rejected', processed_at: Date.now() } });
}

async function hasPendingDivorceRequest(coupleId) {
  if (!db) await connectDatabase();
  const cid = typeof coupleId === 'object' && coupleId?.toString ? coupleId : new ObjectId(coupleId);
  const doc = await db
    .collection('divorce_requests')
    .findOne({ couple_id: cid, status: 'pending' });
  return !!doc;
}

module.exports = {
  connectDatabase,
  initDatabase,
  getCoupleByUser,
  getCoupleByChannel,
  getCoupleById,
  createCouple,
  addLovePoints,
  resetWeeklyPoints,
  getLeaderboard,
  getLeaderboardAllTime,
  deleteCouple,
  createDivorceRequest,
  getPendingDivorceRequests,
  getDivorceRequestById,
  approveDivorce,
  rejectDivorce,
  hasPendingDivorceRequest,
};
