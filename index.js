'use strict';

const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// Import our new modules
const ProblemWorkspace = require('./problem-workspace');
const TestHarness = require('./test-harness');
const AlgorithmCribsheet = require('./algorithm-cribsheet');
const PracticeTracker = require('./practice-tracker');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Initialize our modules
const problemWorkspace = new ProblemWorkspace();
const testHarness = new TestHarness();
const algorithmCribsheet = new AlgorithmCribsheet();
const practiceTracker = new PracticeTracker();

// Initialize modules
(async () => {
  try {
    await problemWorkspace.init();
    await algorithmCribsheet.init();
    await practiceTracker.init();
    console.log('All modules initialized successfully');
  } catch (err) {
    console.error('Error initializing modules:', err);
  }
})();

// In-memory bus registry: { [busId]: { id, lat, lng, routeId, updatedAt } }
const busRegistry = new Map();

app.get('/api/buses', (req, res) => {
  const buses = Array.from(busRegistry.values());
  res.json({ buses });
});

// Problem Workspace API
app.post('/api/problems', async (req, res) => {
  try {
    const result = await problemWorkspace.createProblem(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/problems', async (req, res) => {
  try {
    const problems = await problemWorkspace.getProblems();
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/problems/:id', async (req, res) => {
  try {
    const problem = await problemWorkspace.getProblem(req.params.id);
    res.json(problem);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.patch('/api/problems/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const problem = await problemWorkspace.updateProblemStatus(req.params.id, status);
    res.json(problem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Test Harness API
app.post('/api/problems/:id/test', async (req, res) => {
  try {
    const { language = 'javascript' } = req.body;
    const results = await testHarness.runTests(req.params.id, language);
    const report = testHarness.generateDiffReport(results);
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/problems/:id/test-cases', async (req, res) => {
  try {
    const { input, expected } = req.body;
    const testCases = await testHarness.addTestCase(req.params.id, input, expected);
    res.json(testCases);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Algorithm Cribsheet API
app.get('/api/algorithms', async (req, res) => {
  try {
    const { q: query, category, difficulty, tags } = req.query;
    const filters = { category, difficulty, tags: tags ? tags.split(',') : undefined };
    const algorithms = await algorithmCribsheet.searchAlgorithms(query, filters);
    res.json({ algorithms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/algorithms/:id', async (req, res) => {
  try {
    const algorithm = await algorithmCribsheet.getAlgorithm(req.params.id);
    if (!algorithm) {
      return res.status(404).json({ error: 'Algorithm not found' });
    }
    res.json(algorithm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/algorithms/categories', async (req, res) => {
  try {
    const categories = await algorithmCribsheet.getCategories();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/algorithms/tags', async (req, res) => {
  try {
    const tags = await algorithmCribsheet.getTags();
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/algorithms', async (req, res) => {
  try {
    const algorithm = await algorithmCribsheet.addAlgorithm(req.body);
    res.json(algorithm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Practice Tracker API
app.post('/api/practice/log', async (req, res) => {
  try {
    const attempt = await practiceTracker.logProblemAttempt(req.body);
    res.json(attempt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/practice/statistics', async (req, res) => {
  try {
    const statistics = await practiceTracker.getStatistics();
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/practice/sessions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sessions = await practiceTracker.getRecentSessions(parseInt(limit));
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/practice/progress', async (req, res) => {
  try {
    const progress = await practiceTracker.getProgressReport();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/practice/leaderboard', async (req, res) => {
  try {
    const leaderboard = await practiceTracker.getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/practice/goals', async (req, res) => {
  try {
    const goals = await practiceTracker.updateGoals(req.body);
    res.json(goals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/practice/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const data = await practiceTracker.exportData(format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="practice-data.csv"');
      res.send(data);
    } else {
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  // Send snapshot on connect
  socket.emit('buses:snapshot', Array.from(busRegistry.values()));

  // Driver updates position
  socket.on('bus:location', (payload) => {
    // payload: { id, lat, lng, routeId? }
    if (!payload || typeof payload.id !== 'string') return;
    const now = Date.now();
    const entry = {
      id: payload.id,
      lat: Number(payload.lat),
      lng: Number(payload.lng),
      routeId: payload.routeId || null,
      updatedAt: now,
    };
    if (Number.isFinite(entry.lat) && Number.isFinite(entry.lng)) {
      busRegistry.set(entry.id, entry);
      io.emit('bus:update', entry);
    }
  });

  // Optional: driver mark offline
  socket.on('bus:offline', (busId) => {
    if (typeof busId !== 'string') return;
    if (busRegistry.has(busId)) {
      busRegistry.delete(busId);
      io.emit('bus:remove', busId);
    }
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});



