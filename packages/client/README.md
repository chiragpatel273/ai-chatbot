# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# AI Chatbot Client

A modern React-based chat interface for the AI chatbot service built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Modern UI**: Clean, responsive interface with shadcn/ui components
- 💬 **Real-time Streaming**: Live message streaming with visual indicators
- 🧠 **Conversation Memory**: Persistent chat history with conversation management
- 🎯 **TypeScript**: Full type safety throughout the application
- 🔄 **State Management**: Zustand for efficient state management
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast Development**: Vite for instant hot reload
- 🎪 **Error Handling**: Comprehensive error boundaries and user feedback

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 + CSS Variables
- **UI Components**: shadcn/ui (Radix UI + class-variance-authority)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Dev Tools**: ESLint + TypeScript ESLint

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on http://localhost:3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── ChatMessage.tsx      # Message bubble component
│   │   └── ChatInput.tsx        # Message input with auto-resize
│   ├── ui/
│   │   └── button.tsx           # shadcn/ui button component
│   └── ErrorBoundary.tsx        # Error handling wrapper
├── lib/
│   ├── chat-api.ts              # Backend API integration
│   └── utils.ts                 # Utility functions (cn helper)
├── stores/
│   └── chat-store.ts            # Zustand store for chat state
└── App.tsx                      # Root component
```

## API Integration

The client integrates with the backend chat service supporting:

- **Standard Messages**: JSON request/response for simple interactions
- **Streaming Messages**: Server-Sent Events for real-time responses
- **Conversation Persistence**: Automatic conversation ID management
- **Error Handling**: Graceful degradation for API failures

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
