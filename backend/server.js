require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://todo_user:password123@todo-database:5432/todo_app',
});

// Redis connection
let redisClient;
(async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://todo-redis:6379'
    });
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      redisStatus = 'connected';
    }
  } catch (error) {
    redisStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'todo-backend',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    redis: redisStatus,
    version: '1.0.0'
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get all todos (protected)
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create todo (protected)
app.post('/api/todos', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo (protected)
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const result = await pool.query(
      'UPDATE todos SET title = $1, description = $2, completed = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, completed, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo (protected)
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// AI Chat endpoint (protected)
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  const user_id = req.user.id;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let response = '';
  const lowerMessage = message.toLowerCase();

  try {
    // Greeting
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      response = `👋 Hello ${req.user.username}! I'm your Todo Assistant created by Umema Sultan. I can help you manage your tasks. Try asking me to show your todos, add a new task, or mark something as complete!`;
    }
    // Show todos
    else if (lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('display') || lowerMessage.includes('my todos')) {
      const result = await pool.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
      const todos = result.rows;

      if (todos.length === 0) {
        response = '📝 You don\'t have any todos yet. Would you like to add one?';
      } else {
        const todoList = todos.map(t => `${t.id}. ${t.title} ${t.completed ? '✅' : '⏳'}`).join('\n');
        const completedCount = todos.filter(t => t.completed).length;
        response = `📋 Here are your todos:\n\n${todoList}\n\nTotal: ${todos.length} tasks (${completedCount} completed)`;
      }
    }
    // Add todo
    else if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('new todo')) {
      const titleMatch = message.match(/add.*?(?:todo|task).*?:?\s*(.+)/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        await pool.query(
          'INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3)',
          [user_id, title, 'Added via chatbot']
        );
        response = `✅ Great! I've added "${title}" to your todo list.`;
      } else {
        response = '📝 To add a todo, please use the format: "Add a new todo: [your task name]"';
      }
    }
    // Complete todo
    else if (lowerMessage.includes('complete') || lowerMessage.includes('done') || lowerMessage.includes('finish')) {
      const idMatch = message.match(/(?:todo|task|#)\s*(\d+)/i);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const result = await pool.query(
          'UPDATE todos SET completed = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
          [id, user_id]
        );

        if (result.rows.length > 0) {
          response = `🎉 Awesome! I've marked "${result.rows[0].title}" as completed. Keep up the great work!`;
        } else {
          response = `❌ I couldn't find todo #${id}. Try "show my todos" to see all your tasks.`;
        }
      } else {
        response = '📌 To complete a todo, please specify the number. For example: "Complete todo #1"';
      }
    }
    // Delete todo
    else if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
      const idMatch = message.match(/(?:todo|task|#)\s*(\d+)/i);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const result = await pool.query(
          'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
          [id, user_id]
        );

        if (result.rows.length > 0) {
          response = `🗑️ I've deleted "${result.rows[0].title}" from your list.`;
        } else {
          response = `❌ I couldn't find todo #${id}. Try "show my todos" to see all your tasks.`;
        }
      } else {
        response = '📌 To delete a todo, please specify the number. For example: "Delete todo #1"';
      }
    }
    // Help
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = `🤖 I'm your AI Todo Assistant! Here's what I can do:

📋 **Show Todos**: "Show my todos" or "List all tasks"
➕ **Add Todo**: "Add a new todo: Buy groceries"
✅ **Complete Todo**: "Complete todo #1" or "Mark task #2 as done"
🗑️ **Delete Todo**: "Delete todo #1" or "Remove task #2"
👋 **Chat**: Just say hi and I'll help you out!

Try any of these commands and I'll assist you!`;
    }
    // Default response
    else {
      response = `💬 I understand you said: "${message}"\n\nI can help you manage your todos! Try:\n• "Show my todos"\n• "Add a new todo: [task name]"\n• "Complete todo #1"\n• "Help" for more commands`;
    }

    res.json({ response });
  } catch (err) {
    console.error('Error processing chat:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  if (redisClient) await redisClient.quit();
  process.exit(0);
});
