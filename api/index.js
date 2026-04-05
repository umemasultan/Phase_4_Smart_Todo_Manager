const express = require('express');
const cors = require('cors');
const TodoAgent = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AI Agent
const agent = new TodoAgent();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let todos = [
  { id: 1, title: 'Welcome Todo', description: 'This is your first todo!', completed: false, created_at: new Date() },
  { id: 2, title: 'Try the chatbot', description: 'Ask the AI assistant for help', completed: false, created_at: new Date() }
];
let nextId = 3;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'todo-chatbot-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Create todo
app.post('/api/todos', (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo = {
    id: nextId++,
    title,
    description: description || '',
    completed: false,
    created_at: new Date()
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  const todoIndex = todos.findIndex(t => t.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    title: title !== undefined ? title : todos[todoIndex].title,
    description: description !== undefined ? description : todos[todoIndex].description,
    completed: completed !== undefined ? completed : todos[todoIndex].completed,
    updated_at: new Date()
  };

  res.json(todos[todoIndex]);
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(t => t.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);
  res.json({ message: 'Todo deleted successfully' });
});

// AI Chat endpoint with Agent
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Process message with AI Agent
  const result = agent.processMessage(message, todos);

  // Handle actions based on intent
  if (result.intent === 'add_todo' && result.data.title) {
    const newTodo = {
      id: nextId++,
      title: result.data.title,
      description: 'Added via chatbot',
      completed: false,
      created_at: new Date()
    };
    todos.push(newTodo);
  } else if (result.intent === 'complete_todo' && result.data.id) {
    const todo = todos.find(t => t.id === result.data.id);
    if (todo) {
      todo.completed = true;
    }
  } else if (result.intent === 'delete_todo' && result.data.id) {
    const todoIndex = todos.findIndex(t => t.id === result.data.id);
    if (todoIndex !== -1) {
      todos.splice(todoIndex, 1);
    }
  }

  res.json({
    response: result.response,
    intent: result.intent,
    timestamp: result.timestamp
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Todo Chatbot API',
    author: 'Umema Sultan',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      todos: '/api/todos',
      chat: '/api/chat'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Todo Chatbot API running on port ${PORT}`);
  console.log(`👩‍💻 Developed by: Umema Sultan`);
});

module.exports = app;
