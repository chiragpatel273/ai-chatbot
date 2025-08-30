import { ChatInterface } from '@/components/chat/ChatInterface';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
}

export default App;
