/**
 * Agent Testing Script
 * Author: Umema Sultan
 *
 * Test the AI agent with various inputs
 */

const TodoAgent = require('./agent');
const EnhancedTodoAgent = require('./agent-enhanced');

// Sample todos for testing
const sampleTodos = [
  { id: 1, title: 'Buy groceries', completed: false },
  { id: 2, title: 'Finish homework', completed: false },
  { id: 3, title: 'Call mom', completed: true }
];

console.log('='.repeat(60));
console.log('🤖 Todo Agent Testing');
console.log('='.repeat(60));

// Test Basic Agent
console.log('\n📝 Testing Basic Agent:\n');
const basicAgent = new TodoAgent();

const testMessages = [
  'Hello',
  'Show my todos',
  'Add a new todo: Learn Node.js',
  'Complete todo #1',
  'Delete task 2',
  'Help',
  'What is the weather?'
];

testMessages.forEach(msg => {
  const result = basicAgent.processMessage(msg, sampleTodos);
  console.log(`User: ${msg}`);
  console.log(`Intent: ${result.intent}`);
  console.log(`Bot: ${result.response}`);
  console.log('-'.repeat(60));
});

// Test Enhanced Agent
console.log('\n🚀 Testing Enhanced Agent:\n');
const enhancedAgent = new EnhancedTodoAgent();

const enhancedTestMessages = [
  'Hi there!',
  'Show me what I need to do',
  'Add: Practice coding',
  'Mark 1 as done',
  'How many tasks do I have?',
  'Remove number 2',
  'What can you do?'
];

enhancedTestMessages.forEach(msg => {
  const result = enhancedAgent.processMessage(msg, sampleTodos);
  console.log(`User: ${msg}`);
  console.log(`Intent: ${result.intent} (${Math.round(result.confidence * 100)}% confidence)`);
  console.log(`Bot: ${result.response}`);
  console.log('-'.repeat(60));
});

console.log('\n✅ Testing Complete!');
console.log('='.repeat(60));
