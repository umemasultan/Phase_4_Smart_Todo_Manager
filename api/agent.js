/**
 * AI Agent for Todo Chatbot
 * Author: Umema Sultan
 *
 * This module handles natural language processing and intent detection
 * for the todo chatbot application.
 */

class TodoAgent {
  constructor() {
    this.intents = {
      GREETING: 'greeting',
      SHOW_TODOS: 'show_todos',
      ADD_TODO: 'add_todo',
      COMPLETE_TODO: 'complete_todo',
      DELETE_TODO: 'delete_todo',
      HELP: 'help',
      UNKNOWN: 'unknown'
    };
  }

  /**
   * Detect user intent from message
   * @param {string} message - User's message
   * @returns {object} - Intent and extracted data
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Greeting
    if (this.isGreeting(lowerMessage)) {
      return { intent: this.intents.GREETING, data: {} };
    }

    // Show todos
    if (this.isShowTodos(lowerMessage)) {
      return { intent: this.intents.SHOW_TODOS, data: {} };
    }

    // Add todo
    const addTodoData = this.extractAddTodo(message);
    if (addTodoData) {
      return { intent: this.intents.ADD_TODO, data: addTodoData };
    }

    // Complete todo
    const completeTodoData = this.extractCompleteTodo(message);
    if (completeTodoData) {
      return { intent: this.intents.COMPLETE_TODO, data: completeTodoData };
    }

    // Delete todo
    const deleteTodoData = this.extractDeleteTodo(message);
    if (deleteTodoData) {
      return { intent: this.intents.DELETE_TODO, data: deleteTodoData };
    }

    // Help
    if (this.isHelp(lowerMessage)) {
      return { intent: this.intents.HELP, data: {} };
    }

    // Unknown
    return { intent: this.intents.UNKNOWN, data: { originalMessage: message } };
  }

  /**
   * Check if message is a greeting
   */
  isGreeting(message) {
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i,
      /^(what's up|whats up|sup|yo)/i
    ];
    return greetingPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Check if message is asking to show todos
   */
  isShowTodos(message) {
    const showPatterns = [
      'show',
      'list',
      'display',
      'view',
      'my todos',
      'my tasks',
      'all todos',
      'all tasks',
      'what do i have',
      'what are my'
    ];
    return showPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Extract todo title from add command
   */
  extractAddTodo(message) {
    const lowerMessage = message.toLowerCase();

    if (!lowerMessage.includes('add') &&
        !lowerMessage.includes('create') &&
        !lowerMessage.includes('new')) {
      return null;
    }

    // Pattern: "add todo: title" or "create task: title"
    const colonMatch = message.match(/(?:add|create|new).*?(?:todo|task).*?:?\s*(.+)/i);
    if (colonMatch && colonMatch[1]) {
      return { title: colonMatch[1].trim() };
    }

    return null;
  }

  /**
   * Extract todo ID from complete command
   */
  extractCompleteTodo(message) {
    const lowerMessage = message.toLowerCase();

    if (!lowerMessage.includes('complete') &&
        !lowerMessage.includes('done') &&
        !lowerMessage.includes('finish') &&
        !lowerMessage.includes('mark')) {
      return null;
    }

    // Pattern: "complete todo #1" or "mark task 2 as done"
    const idMatch = message.match(/(?:todo|task|#)\s*(\d+)/i);
    if (idMatch) {
      return { id: parseInt(idMatch[1]) };
    }

    return null;
  }

  /**
   * Extract todo ID from delete command
   */
  extractDeleteTodo(message) {
    const lowerMessage = message.toLowerCase();

    if (!lowerMessage.includes('delete') &&
        !lowerMessage.includes('remove') &&
        !lowerMessage.includes('clear')) {
      return null;
    }

    // Pattern: "delete todo #1" or "remove task 2"
    const idMatch = message.match(/(?:todo|task|#)\s*(\d+)/i);
    if (idMatch) {
      return { id: parseInt(idMatch[1]) };
    }

    return null;
  }

  /**
   * Check if message is asking for help
   */
  isHelp(message) {
    const helpPatterns = [
      'help',
      'what can you do',
      'how do i',
      'commands',
      'instructions',
      'guide'
    ];
    return helpPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Generate response based on intent and context
   * @param {string} intent - Detected intent
   * @param {object} data - Extracted data
   * @param {array} todos - Current todos list
   * @returns {string} - Response message
   */
  generateResponse(intent, data, todos = []) {
    switch (intent) {
      case this.intents.GREETING:
        return this.getGreetingResponse();

      case this.intents.SHOW_TODOS:
        return this.getShowTodosResponse(todos);

      case this.intents.ADD_TODO:
        return this.getAddTodoResponse(data.title);

      case this.intents.COMPLETE_TODO:
        return this.getCompleteTodoResponse(data.id, todos);

      case this.intents.DELETE_TODO:
        return this.getDeleteTodoResponse(data.id, todos);

      case this.intents.HELP:
        return this.getHelpResponse();

      case this.intents.UNKNOWN:
      default:
        return this.getUnknownResponse(data.originalMessage);
    }
  }

  getGreetingResponse() {
    return '👋 Hello! I\'m your Todo Assistant created by Umema Sultan. I can help you manage your tasks. Try asking me to show your todos, add a new task, or mark something as complete!';
  }

  getShowTodosResponse(todos) {
    if (todos.length === 0) {
      return '📝 You don\'t have any todos yet. Would you like to add one?';
    }

    const todoList = todos.map(t =>
      `${t.id}. ${t.title} ${t.completed ? '✅' : '⏳'}`
    ).join('\n');

    const completedCount = todos.filter(t => t.completed).length;

    return `📋 Here are your todos:\n\n${todoList}\n\nTotal: ${todos.length} tasks (${completedCount} completed)`;
  }

  getAddTodoResponse(title) {
    return `✅ Great! I've added "${title}" to your todo list.`;
  }

  getCompleteTodoResponse(id, todos) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      return `🎉 Awesome! I've marked "${todo.title}" as completed. Keep up the great work!`;
    }
    return `❌ I couldn't find todo #${id}. Try "show my todos" to see all your tasks.`;
  }

  getDeleteTodoResponse(id, todos) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      return `🗑️ I've deleted "${todo.title}" from your list.`;
    }
    return `❌ I couldn't find todo #${id}. Try "show my todos" to see all your tasks.`;
  }

  getHelpResponse() {
    return `🤖 I'm your AI Todo Assistant! Here's what I can do:

📋 **Show Todos**: "Show my todos" or "List all tasks"
➕ **Add Todo**: "Add a new todo: Buy groceries"
✅ **Complete Todo**: "Complete todo #1" or "Mark task #2 as done"
🗑️ **Delete Todo**: "Delete todo #1" or "Remove task #2"
👋 **Chat**: Just say hi and I'll help you out!

Try any of these commands and I'll assist you!`;
  }

  getUnknownResponse(message) {
    return `💬 I understand you said: "${message}"\n\nI can help you manage your todos! Try:\n• "Show my todos"\n• "Add a new todo: [task name]"\n• "Complete todo #1"\n• "Help" for more commands`;
  }

  /**
   * Process message and return response
   * @param {string} message - User message
   * @param {array} todos - Current todos
   * @returns {object} - Response with intent and message
   */
  processMessage(message, todos = []) {
    const { intent, data } = this.detectIntent(message);
    const response = this.generateResponse(intent, data, todos);

    return {
      intent,
      data,
      response,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TodoAgent;
