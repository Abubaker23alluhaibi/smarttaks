const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountRaw) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
}

const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing auth token' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = decoded.uid;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'smart-task-planner-backend' });
});

app.get('/tasks', authMiddleware, async (req, res) => {
  const snap = await db.collection('users').doc(req.userId).collection('meta').doc('tasks').get();
  if (!snap.exists) {
    return res.json({ tasks: [] });
  }
  const data = snap.data();
  return res.json({ tasks: Array.isArray(data?.tasks) ? data.tasks : [] });
});

app.put('/tasks', authMiddleware, async (req, res) => {
  const tasks = Array.isArray(req.body?.tasks) ? req.body.tasks : [];
  await db.collection('users').doc(req.userId).collection('meta').doc('tasks').set(
    {
      tasks,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
  return res.json({ ok: true });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
