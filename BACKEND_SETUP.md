# PT TAK - Real-Time Training Backend Setup

## Backend Architecture

The backend uses:
- **Express.js** - REST API server
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

## Getting Started

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Start the Backend Server

**On Windows/Mac/Linux:**
```bash
npm start      # Production mode (node server.js)
npm run dev    # Development mode with auto-reload (nodemon)
```

**On Windows (if npm scripts don't work):**
```bash
PORT=3001 node server.js
```

The server will run on `http://localhost:3001`

### 3. Environment Variables (Optional)

Create a `.env` file in the `backend/` folder:

```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  - Body: `{ name, email, password, role: 'host' | 'user' }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /api/auth/me` - Get current user (requires auth header)
  - Returns: Current user info

### Programs (Training Plans)

- `POST /api/programs` - Create new program (host only)
  - Body: `{ title, description, difficulty, durationWeeks, workouts }`
  - Returns: Created program with ID

- `GET /api/programs` - Get user's programs
  - (Hosts see their own, users see assigned ones)

- `GET /api/programs/:id` - Get specific program

- `PUT /api/programs/:id` - Update program (host only)

- `POST /api/programs/:id/assign` - Assign program to trainee (host only)
  - Body: `{ userId }`

### Completions (Workout Records)

- `POST /api/completions` - Mark workout as complete
  - Body: `{ workoutId, programId }`

- `GET /api/completions` - Get user's completions
  - (Hosts see all completions for their programs, users see their own)

## Real-Time Events (WebSocket)

Connect with Socket.io and authenticate:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

socket.emit('user:authenticate', token);
```

### Emitted Events

- `program:created` - New program created
- `program:updated` - Program updated
- `program:assigned` - Program assigned to user
- `workout:completed` - Workout completed

### Events to Listen For

All events from above trigger real-time updates on connected clients.

## Frontend Configuration

Set the backend URL in your frontend `.env` file:

```
REACT_APP_API_URL=http://localhost:5000
```

Or it defaults to `http://localhost:5000`

## Database

Currently uses **in-memory storage** for demo purposes. For production, implement:

- MongoDB (recommended)
- PostgreSQL
- Firebase
- Any other database

Replace the `db` object in `server.js` with actual database models.

## Running Both Frontend & Backend

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Frontend will be at `http://localhost:5173`
Backend will be at `http://localhost:5000`

## Testing

Try the following flow:

1. Register a new **Host** account
2. Register a new **User** account
3. As Host: Create a training program
4. As Host: Assign program to a user (via trainees tab)
5. As User: See the assigned program in dashboard
6. As User: Mark workouts as complete
7. Watch real-time updates sync across connected clients

## Security Notes

- JWT tokens are stored in `localStorage` (frontend)
- Change `JWT_SECRET` in production
- Use HTTPS in production
- Add rate limiting for API endpoints
- Validate all inputs on backend
- Use environment variables for sensitive data

## Troubleshooting

**"Cannot connect to backend"**
- Ensure backend is running on port 5000
- Check CORS settings in server.js
- Verify `REACT_APP_API_URL` is correct

**"WebSocket connection failed"**
- Backend server must be running
- Socket.io client must be initialized with valid token
- Check browser console for detailed errors

**"Authentication failed"**
- Ensure credentials are correct
- Token may be expired (re-login required)
- Check JWT_SECRET is consistent
