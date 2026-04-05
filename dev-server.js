const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7860;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// In-memory storage for development
let todos = [
  { id: 1, title: 'Welcome Todo', description: 'This is your first todo!', completed: false, created_at: new Date() },
  { id: 2, title: 'Try the chatbot', description: 'Ask the AI assistant for help', completed: false, created_at: new Date() }
];
let nextId = 3;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'todo-chatbot-dev',
    timestamp: new Date().toISOString(),
    mode: 'development'
  });
});

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Create todo
app.post('/api/todos', (req, res) => {
  const { title, description } = req.body;
  const newTodo = {
    id: nextId++,
    title,
    description,
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

// AI Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let response = '';
  const lowerMessage = message.toLowerCase();

  // Greeting responses
  if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
    response = '👋 Hello! I\'m your Todo Assistant created by Umema Sultan. I can help you manage your tasks. Try asking me to show your todos, add a new task, or mark something as complete!';
  }
  // Show todos
  else if (lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('display') || lowerMessage.includes('my todos')) {
    if (todos.length === 0) {
      response = '📝 You don\'t have any todos yet. Would you like to add one?';
    } else {
      const todoList = todos.map(t => `${t.id}. ${t.title} ${t.completed ? '✅' : '⏳'}`).join('\n');
      response = `📋 Here are your todos:\n\n${todoList}\n\nTotal: ${todos.length} tasks (${todos.filter(t => t.completed).length} completed)`;
    }
  }
  // Add todo
  else if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('new todo')) {
    const titleMatch = message.match(/add.*?(?:todo|task).*?:?\s*(.+)/i);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      const newTodo = {
        id: nextId++,
        title: title,
        description: 'Added via chatbot',
        completed: false,
        created_at: new Date()
      };
      todos.push(newTodo);
      response = `✅ Great! I've added "${title}" to your todo list. You now have ${todos.length} tasks.`;
    } else {
      response = '📝 To add a todo, please use the format: "Add a new todo: [your task name]"';
    }
  }
  // Complete todo
  else if (lowerMessage.includes('complete') || lowerMessage.includes('done') || lowerMessage.includes('finish')) {
    const idMatch = message.match(/(?:todo|task|#)\s*(\d+)/i);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = true;
        response = `🎉 Awesome! I've marked "${todo.title}" as completed. Keep up the great work!`;
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
      const todoIndex = todos.findIndex(t => t.id === id);
      if (todoIndex !== -1) {
        const deletedTodo = todos[todoIndex];
        todos.splice(todoIndex, 1);
        response = `🗑️ I've deleted "${deletedTodo.title}" from your list.`;
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
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Todo Chatbot Development Server');
  console.log('='.repeat(60));
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`📝 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Todos API: http://localhost:${PORT}/api/todos`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log('='.repeat(60));
  console.log('👩‍💻 Developed by: Umema Sultan');
  console.log('⏰ Started at:', new Date().toLocaleString());
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
