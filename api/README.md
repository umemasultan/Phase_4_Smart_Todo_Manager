# Todo Chatbot API

Standalone API for Todo Chatbot application.

**Author:** Umema Sultan

## Endpoints

### Health Check
```
GET /api/health
```

### Todos
```
GET /api/todos - Get all todos
POST /api/todos - Create a new todo
PUT /api/todos/:id - Update a todo
DELETE /api/todos/:id - Delete a todo
```

### Chat
```
POST /api/chat - Chat with AI assistant
Body: { "message": "your message" }
```

## Local Development

```bash
cd api
npm install
npm start
```

API will run on `http://localhost:3000`

## Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

## Deploy to Render

1. Create account on render.com
2. New Web Service
3. Connect your GitHub repo
4. Set root directory to `api`
5. Build command: `npm install`
6. Start command: `npm start`

## Deploy to Railway

1. Create account on railway.app
2. New Project → Deploy from GitHub
3. Select this repo
4. Set root directory to `api`
5. Deploy!

## Environment Variables

- `PORT` - Server port (default: 3000)

---

**© 2026 Umema Sultan**
