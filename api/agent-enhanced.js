/**
 * Enhanced AI Agent with Advanced NLP
 * Author: Umema Sultan
 *
 * This is an enhanced version with better intent detection,
 * context awareness, and conversation memory.
 */

class EnhancedTodoAgent {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {
      lastIntent: null,
      pendingAction: null,
      userName: null
    };

    this.responses = {
      greeting: [
        '👋 Hello! I\'m your Todo Assistant. How can I help you today?',
        '👋 Hi there! Ready to manage your tasks?',
        '👋 Hey! Let\'s get your todos organized!'
      ],
      success: [
        '✅ Done! Anything else?',
        '✅ Perfect! What\'s next?',
        '✅ Great! Need help with anything else?'
      ],
      encouragement: [
        '🎉 You\'re doing great!',
        '💪 Keep it up!',
        '⭐ Awesome work!'
      ]
    };
  }

  /**
   * Advanced intent detection with context
   */
  detectIntent(message) {
    const msg = message.toLowerCase().trim();
    const words = msg.split(/\s+/);

    // Multi-word intent detection
    const intents = {
      greeting: this.scoreGreeting(msg, words),
      showTodos: this.scoreShowTodos(msg, words),
      addTodo: this.scoreAddTodo(msg, words),
      completeTodo: this.scoreCompleteTodo(msg, words),
      deleteTodo: this.scoreDeleteTodo(msg, words),
      help: this.scoreHelp(msg, words),
      stats: this.scoreStats(msg, words)
    };

    // Find highest scoring intent
    const maxIntent = Object.entries(intents).reduce((max, [intent, score]) =>
      score > max.score ? { intent, score } : max
    , { intent: 'unknown', score: 0 });

    if (maxIntent.score < 0.3) {
      return { intent: 'unknown', confidence: maxIntent.score, data: {} };
    }

    // Extract data based on intent
    const data = this.extractData(maxIntent.intent, message);

    return {
      intent: maxIntent.intent,
      confidence: maxIntent.score,
      data
    };
  }

  scoreGreeting(msg, words) {
    const greetingWords = ['hi', 'hello', 'hey', 'greetings', 'good', 'morning', 'afternoon', 'evening'];
    const score = words.filter(w => greetingWords.includes(w)).length / words.length;
    return msg.length < 20 ? score * 1.5 : score;
  }

  scoreShowTodos(msg, words) {
    const showWords = ['show', 'list', 'display', 'view', 'see', 'todos', 'tasks'];
    return words.filter(w => showWords.includes(w)).length / words.length;
  }

  scoreAddTodo(msg, words) {
    const addWords = ['add', 'create', 'new', 'make', 'todo', 'task'];
    const hasColon = msg.includes(':');
    const score = words.filter(w => addWords.includes(w)).length / words.length;
    return hasColon ? score * 1.3 : score;
  }

  scoreCompleteTodo(msg, words) {
    const completeWords = ['complete', 'done', 'finish', 'mark', 'check'];
    const hasNumber = /\d+/.test(msg);
    const score = words.filter(w => completeWords.includes(w)).length / words.length;
    return hasNumber ? score * 1.3 : score;
  }

  scoreDeleteTodo(msg, words) {
    const deleteWords = ['delete', 'remove', 'clear', 'erase'];
    const hasNumber = /\d+/.test(msg);
    const score = words.filter(w => deleteWords.includes(w)).length / words.length;
    return hasNumber ? score * 1.3 : score;
  }

  scoreHelp(msg, words) {
    const helpWords = ['help', 'how', 'what', 'can', 'commands', 'guide'];
    return words.filter(w => helpWords.includes(w)).length / words.length;
  }

  scoreStats(msg, words) {
    const statsWords = ['stats', 'statistics', 'summary', 'count', 'how many'];
    return words.filter(w => statsWords.includes(w)).length / words.length;
  }

  extractData(intent, message) {
    switch (intent) {
      case 'addTodo':
        return this.extractAddTodoData(message);
      case 'completeTodo':
      case 'deleteTodo':
        return this.extractTodoId(message);
      default:
        return {};
    }
  }

  extractAddTodoData(message) {
    // Try to extract title after colon
    const colonMatch = message.match(/:\s*(.+)/);
    if (colonMatch) {
      return { title: colonMatch[1].trim() };
    }

    // Try to extract after "add/create"
    const addMatch = message.match(/(?:add|create|new)\s+(?:todo|task)?\s*(.+)/i);
    if (addMatch) {
      return { title: addMatch[1].trim() };
    }

    return { title: null };
  }

  extractTodoId(message) {
    const idMatch = message.match(/(?:todo|task|#)?\s*(\d+)/i);
    return idMatch ? { id: parseInt(idMatch[1]) } : { id: null };
  }

  /**
   * Generate contextual response
   */
  generateResponse(intent, data, todos = [], confidence = 1.0) {
    // Low confidence fallback
    if (confidence < 0.5) {
      return this.getLowConfidenceResponse();
    }

    switch (intent) {
      case 'greeting':
        return this.getRandomResponse(this.responses.greeting);

      case 'showTodos':
        return this.getShowTodosResponse(todos);

      case 'addTodo':
        if (!data.title) {
          return '📝 What would you like to add? Please tell me the task name.';
        }
        return `✅ Added "${data.title}" to your list!`;

      case 'completeTodo':
        if (!data.id) {
          return '📌 Which todo would you like to complete? Please specify the number.';
        }
        const todo = todos.find(t => t.id === data.id);
        return todo
          ? `🎉 Marked "${todo.title}" as complete! ${this.getRandomResponse(this.responses.encouragement)}`
          : `❌ Couldn't find todo #${data.id}.`;

      case 'deleteTodo':
        if (!data.id) {
          return '📌 Which todo would you like to delete? Please specify the number.';
        }
        const deleteTodo = todos.find(t => t.id === data.id);
        return deleteTodo
          ? `🗑️ Deleted "${deleteTodo.title}".`
          : `❌ Couldn't find todo #${data.id}.`;

      case 'stats':
        return this.getStatsResponse(todos);

      case 'help':
        return this.getHelpResponse();

      default:
        return this.getUnknownResponse();
    }
  }

  getShowTodosResponse(todos) {
    if (todos.length === 0) {
      return '📝 Your todo list is empty. Ready to add your first task?';
    }

    const pending = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);

    let response = '📋 **Your Todos:**\n\n';

    if (pending.length > 0) {
      response += '⏳ **Pending:**\n';
      pending.forEach(t => {
        response += `  ${t.id}. ${t.title}\n`;
      });
    }

    if (completed.length > 0) {
      response += '\n✅ **Completed:**\n';
      completed.forEach(t => {
        response += `  ${t.id}. ${t.title}\n`;
      });
    }

    response += `\n📊 Total: ${todos.length} (${completed.length} done, ${pending.length} pending)`;

    return response;
  }

  getStatsResponse(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return `📊 **Your Stats:**

Total Tasks: ${total}
✅ Completed: ${completed}
⏳ Pending: ${pending}
📈 Completion Rate: ${completionRate}%

${completionRate > 70 ? '🌟 Great job! You\'re crushing it!' : '💪 Keep going! You got this!'}`;
  }

  getHelpResponse() {
    return `🤖 **Todo Assistant Commands:**

📋 **View Todos**
   "Show my todos" | "List tasks"

➕ **Add Todo**
   "Add: Buy groceries" | "Create task: Call mom"

✅ **Complete Todo**
   "Complete #1" | "Mark task 2 as done"

🗑️ **Delete Todo**
   "Delete #1" | "Remove task 2"

📊 **Statistics**
   "Show stats" | "How many tasks"

💡 **Tip:** You can chat naturally! I'll understand what you mean.

---
Created by Umema Sultan`;
  }

  getLowConfidenceResponse() {
    return `🤔 I'm not quite sure what you mean. Try:
• "Show my todos"
• "Add: [task name]"
• "Complete #[number]"
• "Help" for more commands`;
  }

  getUnknownResponse() {
    return `💬 I can help you manage your todos! Try:
• "Show my todos"
• "Add a new todo: [task name]"
• "Complete todo #1"
• "Help" for all commands`;
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Process message with full context
   */
  processMessage(message, todos = []) {
    const { intent, confidence, data } = this.detectIntent(message);
    const response = this.generateResponse(intent, data, todos, confidence);

    // Update context
    this.userContext.lastIntent = intent;
    this.conversationHistory.push({
      message,
      intent,
      confidence,
      response,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 messages
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }

    return {
      intent,
      confidence,
      data,
      response,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    this.userContext = {
      lastIntent: null,
      pendingAction: null,
      userName: null
    };
  }
}

module.exports = EnhancedTodoAgent;
