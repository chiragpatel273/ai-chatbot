# AI Chatbot 🤖

A modern, full-stack AI chatbot application built with React, TypeScript, Express, and Groq's Llama 3 model. Features real-time streaming responses, conversation management, and a beautiful, responsive interface.

## ✨ Features

### Frontend

- 🎨 **Modern UI**: Clean, responsive interface built with React 19 + shadcn/ui components
- 💬 **Real-time Streaming**: Live message streaming with visual typing indicators
- 🧠 **Conversation Management**: Persistent chat history with sidebar navigation
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎯 **Full TypeScript**: Complete type safety throughout the application
- 🔄 **State Management**: Zustand for efficient global state management
- ✨ **Markdown Support**: Rich text rendering for AI responses (code blocks, lists, emphasis)
- 🎪 **Error Handling**: Comprehensive error boundaries and user feedback

### Backend

- ⚡ **Express + TypeScript**: Modern Node.js backend with full type safety
- 🤖 **Groq Integration**: Powered by Llama 3 via Groq's fast inference API
- 🔄 **Streaming Responses**: Server-Sent Events (SSE) for real-time chat
- 💾 **Conversation Memory**: Persistent chat history and context management
- 📝 **Structured Logging**: Pino logger for comprehensive request tracking
- 🔧 **API Documentation**: Swagger UI for interactive API exploration
- 🛡️ **Input Validation**: Zod schemas for request/response validation
- 🌐 **CORS Support**: Properly configured for cross-origin requests

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (Radix UI + class-variance-authority)
- **State Management**: Zustand
- **HTTP Client**: Axios (with fetch for streaming)
- **Icons**: Lucide React
- **Markdown**: ReactMarkdown
- **Dev Tools**: ESLint + TypeScript ESLint

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5
- **AI Model**: Groq Llama 3 (70B-8192)
- **Validation**: Zod schemas
- **Logging**: Pino structured logging
- **Documentation**: Swagger UI + OpenAPI
- **Development**: ts-node-dev with hot reload

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key (get one at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/chiragpatel273/ai-chatbot.git
   cd ai-chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create `.env` file in `packages/server/`:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development servers**

   **Backend (Terminal 1):**

   ```bash
   cd packages/server
   npm run dev
   ```

   **Frontend (Terminal 2):**

   ```bash
   cd packages/client
   npm run dev
   ```

5. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/v1/docs

## 📁 Project Structure

```
ai-chatbot/
├── packages/
│   ├── client/                 # React frontend application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── chat/       # Chat-specific components
│   │   │   │   │   ├── ChatInterface.tsx      # Main chat container
│   │   │   │   │   ├── ChatMessage.tsx        # Message rendering
│   │   │   │   │   ├── ChatInput.tsx          # Input with auto-resize
│   │   │   │   │   └── ConversationList.tsx   # Sidebar navigation
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   └── ErrorBoundary.tsx          # Error handling
│   │   │   ├── lib/
│   │   │   │   ├── chat-api.ts    # API client with streaming
│   │   │   │   └── utils.ts       # Utility functions
│   │   │   ├── stores/
│   │   │   │   └── chat-store.ts  # Zustand state management
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── server/                 # Express backend API
│       ├── src/
│       │   ├── domain/
│       │   │   └── chat/       # Chat business logic
│       │   │       ├── chat.controller.ts     # HTTP request handling
│       │   │       ├── chat.service.ts        # Groq API integration
│       │   │       ├── chat.router.ts         # Route definitions
│       │   │       └── memory.ts              # Conversation storage
│       │   ├── routes/         # API route modules
│       │   ├── utils/          # Logging and utilities
│       │   ├── app.ts          # Express app configuration
│       │   └── index.ts        # Server entry point
│       ├── package.json
│       └── tsconfig.json
├── package.json               # Root workspace configuration
└── README.md                 # This file
```

## 🔧 API Endpoints

### Chat Endpoints

- `POST /api/v1/chat` - Send message (supports streaming)
- `GET /api/v1/health` - Health check
- `GET /api/v1/docs` - Swagger documentation

### Chat Request Format

```typescript
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "conversationId": "optional-uuid",
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 2048
}
```

### Streaming Response

Server-Sent Events format:

```
data: {"content": "Hello"}
data: {"content": " there!"}
data: {"type": "done", "conversationId": "uuid"}
```

## 🎯 Key Features Explained

### Real-time Streaming

- Uses Server-Sent Events (SSE) for live response streaming
- Hybrid HTTP approach: Axios for regular requests, fetch for streaming
- Visual typing indicator with animated cursor
- Graceful fallback for connection issues

### Conversation Management

- UUID-based conversation identification
- Automatic conversation persistence
- Context-aware responses with full message history
- Sidebar with conversation list and search
- Delete conversations with confirmation

### State Management

- Centralized Zustand store for all chat state
- Optimistic updates for immediate UI feedback
- Real-time message updates during streaming
- Computed selectors for derived state

### Error Handling

- React Error Boundaries for component-level errors
- API error handling with user-friendly messages
- Stream interruption handling and reconnection
- Validation errors with detailed feedback

## 🚀 Development

### Available Scripts

**Root level:**

```bash
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting
```

**Frontend (packages/client):**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend (packages/server):**

```bash
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run typecheck    # Type checking only
npm run dev:debug    # Start with debugger
```

### Environment Variables

**Backend (.env in packages/server/):**

```env
GROQ_API_KEY=your_api_key          # Required: Groq API key
PORT=3000                          # Server port (default: 3000)
NODE_ENV=development               # Environment mode
LOG_LEVEL=info                     # Logging level
```

### Adding New Features

1. **New Chat Components**: Add to `packages/client/src/components/chat/`
2. **API Endpoints**: Add to `packages/server/src/domain/` or `packages/server/src/routes/`
3. **State Management**: Extend `packages/client/src/stores/chat-store.ts`
4. **Types**: Define in respective module files with TypeScript interfaces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build/tooling changes

## Acknowledgments

- [Groq](https://groq.com) for fast inference API
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Vite](https://vitejs.dev) for lightning-fast development
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Zustand](https://zustand-demo.pmnd.rs) for simple state management

## 🔗 Links

- [Live Demo](https://your-demo-url.com) _(Update with your deployment URL)_
- [API Documentation](http://localhost:3000/api/v1/docs) _(When running locally)_
- [Groq Console](https://console.groq.com)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

---

Built with ❤️ using React, TypeScript, and Groq's Llama 3
