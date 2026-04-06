const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: ['http://localhost:3002', 'http://localhost:3003', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (replace with MongoDB/PostgreSQL for production)
const db = {
  users: [],
  programs: [],
  completions: [],
  healthMetrics: [],
  connections: {} // Track connected users
};

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const computeAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob)) return null;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

const getLatestHealthMetric = (userId) => {
  const metrics = db.healthMetrics
    .filter(metric => metric.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return metrics.length ? metrics[0] : null;
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Middleware: Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Routes: Authentication
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, dateOfBirth, height, weight } = req.body;

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await hashPassword(password);
  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    role,
    avatar: `https://picsum.photos/seed/${email}/100`,
    dateOfBirth: dateOfBirth || null,
    height: height || null,
    weight: weight || null,
    age: req.body.age || null,
    gpsLocation: null,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  const token = generateToken(user.id);

  res.status(201).json({
    token,
    user: { id: user.id, name, email, role, avatar: user.avatar, dateOfBirth, height, weight }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  const missingFields = [];
  if (!user.dateOfBirth) missingFields.push('dateOfBirth');
  if (!user.height) missingFields.push('height');

  const age = computeAge(user.dateOfBirth);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
      height: user.height,
      weight: user.weight,
      age
    },
    profileIncomplete: missingFields.length > 0,
    missingFields
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    avatar: user.avatar,
    dateOfBirth: user.dateOfBirth,
    height: user.height,
    weight: user.weight,
    age: computeAge(user.dateOfBirth),
    gpsLocation: user.gpsLocation,
    latestHealthMetric: getLatestHealthMetric(user.id)
  });
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { dateOfBirth, height, weight } = req.body;
  const user = db.users.find(u => u.id === req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (height) user.height = height;
  if (req.body.age !== undefined) user.age = req.body.age;
  if (weight) user.weight = weight;

  res.json({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    avatar: user.avatar,
    dateOfBirth: user.dateOfBirth,
    height: user.height,
    weight: user.weight,
    age: computeAge(user.dateOfBirth),
    gpsLocation: user.gpsLocation,
    latestHealthMetric: getLatestHealthMetric(user.id)
  });
});

app.post('/api/health/metrics', authenticateToken, (req, res) => {
  const { steps, heartRate, caloriesBurned, sleepHours, distanceKm, notes } = req.body;
  const user = db.users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newMetric = {
    id: `metric-${Date.now()}`,
    userId: user.id,
    date: new Date().toISOString(),
    steps: steps ?? null,
    heartRate: heartRate ?? null,
    caloriesBurned: caloriesBurned ?? null,
    sleepHours: sleepHours ?? null,
    distanceKm: distanceKm ?? null,
    notes: notes ?? null
  };

  db.healthMetrics.push(newMetric);
  res.status(201).json(newMetric);
});

app.get('/api/health/metrics', authenticateToken, (req, res) => {
  const metrics = db.healthMetrics
    .filter(metric => metric.userId === req.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(metrics);
});

app.post('/api/auth/location', authenticateToken, (req, res) => {
  const { latitude, longitude } = req.body;
  const user = db.users.find(u => u.id === req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.gpsLocation = {
    latitude,
    longitude,
    timestamp: new Date().toISOString()
  };

  // Broadcast location update to all users
  io.emit('user:location-updated', { userId: user.id, location: user.gpsLocation });

  res.json({ gpsLocation: user.gpsLocation });
});

// Routes: Programs (Host)
app.post('/api/programs', authenticateToken, (req, res) => {
  const { title, description, difficulty, durationWeeks, workouts } = req.body;
  const program = {
    id: `prog-${Date.now()}`,
    title,
    description,
    difficulty,
    durationWeeks,
    workouts: workouts || [],
    hostId: req.userId,
    assignedUserIds: [],
    createdAt: new Date().toISOString()
  };

  db.programs.push(program);

  // Broadcast to all connected users (for real-time updates)
  io.emit('program:created', program);

  res.status(201).json(program);
});

app.get('/api/programs', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);
  
  if (user.role === 'host') {
    // Hosts see their own programs
    const programs = db.programs.filter(p => p.hostId === req.userId);
    res.json(programs);
  } else {
    // Users see programs assigned to them
    const programs = db.programs.filter(p => p.assignedUserIds.includes(req.userId));
    res.json(programs);
  }
});

app.get('/api/programs/:id', authenticateToken, (req, res) => {
  const program = db.programs.find(p => p.id === req.params.id);
  if (!program) {
    return res.status(404).json({ error: 'Program not found' });
  }
  res.json(program);
});

app.put('/api/programs/:id', authenticateToken, (req, res) => {
  const program = db.programs.find(p => p.id === req.params.id);
  if (!program || program.hostId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  Object.assign(program, req.body);
  program.updatedAt = new Date().toISOString();

  // Broadcast update to all connected users
  io.emit('program:updated', program);

  res.json(program);
});

app.post('/api/programs/:id/assign', authenticateToken, (req, res) => {
  const { userId } = req.body;
  const program = db.programs.find(p => p.id === req.params.id);

  if (!program || program.hostId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (!program.assignedUserIds.includes(userId)) {
    program.assignedUserIds.push(userId);
  }

  // Broadcast assignment to the assigned user
  io.emit('program:assigned', { programId: program.id, userId, program });

  res.json(program);
});

// Routes: Completions (Workouts)
app.post('/api/completions', authenticateToken, (req, res) => {
  const { workoutId, programId } = req.body;
  
  const completion = {
    id: `comp-${Date.now()}`,
    userId: req.userId,
    workoutId,
    programId,
    date: new Date().toISOString(),
    completed: true
  };

  db.completions.push(completion);

  // Broadcast completion to host and other trainees
  io.emit('workout:completed', completion);

  res.status(201).json(completion);
});

app.get('/api/completions', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);

  if (user.role === 'host') {
    // Hosts see completions for their programs
    const hostPrograms = db.programs.filter(p => p.hostId === req.userId);
    const completions = db.completions.filter(c =>
      hostPrograms.some(p => p.id === c.programId)
    );
    res.json(completions);
  } else {
    // Users see their own completions
    const completions = db.completions.filter(c => c.userId === req.userId);
    res.json(completions);
  }
});

// Routes: Users (Host only)
app.get('/api/users', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);

  if (user.role !== 'host') {
    return res.status(403).json({ error: 'Only hosts can view users' });
  }

  const trainees = db.users
    .filter(u => u.role === 'user')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      dateOfBirth: u.dateOfBirth,
      height: u.height,
      weight: u.weight,
      gpsLocation: u.gpsLocation,
      latestHealthMetric: getLatestHealthMetric(u.id)
    }));

  res.json(trainees);
});

// Socket.io: Real-time connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('user:authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      db.connections[decoded.userId] = socket.id;
      socket.userId = decoded.userId;
      socket.emit('authenticated', { userId: decoded.userId });
    } catch (error) {
      socket.emit('error', { message: 'Authentication failed' });
    }
  });

  socket.on('program:view', (programId) => {
    socket.join(`program-${programId}`);
    io.to(`program-${programId}`).emit('user:viewing', { userId: socket.userId, programId });
  });

  socket.on('message', (data) => {
    // Broadcast message to all connected users
    io.emit('message', { userId: socket.userId, ...data });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      delete db.connections[socket.userId];
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 PT TAK Backend running on http://localhost:${PORT}`);
  console.log(`📡 Real-time updates enabled via WebSocket`);
});
