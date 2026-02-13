'use client';

import { useState } from 'react';
import Chat from '@/components/Chat';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
  };

  return (
    <main className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar for History */}
      <Sidebar 
        currentId={currentConversationId} 
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute top-8 text-center pointer-events-none z-0 opacity-10">
          <h1 className="text-9xl font-black text-blue-600">COSINT</h1>
        </div>
        <Chat 
          conversationId={currentConversationId} 
          onIdGenerated={setCurrentConversationId}
        />
      </div>
    </main>
  );
}
