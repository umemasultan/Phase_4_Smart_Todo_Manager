const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 8080;

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

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create todo
app.post('/api/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const result = await pool.query(
      'UPDATE todos SET title = $1, description = $2, completed = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [title, description, completed, id]
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

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, user_id = 1 } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let response = '';
  const lowerMessage = message.toLowerCase();

  try {
    // Greeting
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      response = '👋 Hello! I\'m your Todo Assistant created by Umema Sultan. I can help you manage your tasks. Try asking me to show your todos, add a new task, or mark something as complete!';
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
