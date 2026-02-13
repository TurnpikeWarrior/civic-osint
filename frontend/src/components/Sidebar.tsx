'use client';

import { useState, useEffect } from 'react';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

type SidebarProps = {
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
};

export default function Sidebar({ currentId, onSelect, onNewChat }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [currentId]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:8000/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <span className="text-xl">+</span> New Intelligence Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">
          Past Briefings
        </h3>
        <div className="space-y-1">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500 italic">Loading history...</div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 italic">No past briefings</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-4 py-2 text-sm rounded-md truncate transition-colors ${
                  currentId === conv.id
                    ? 'bg-gray-800 text-white font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        COSINT v1.0
      </div>
    </div>
  );
}
