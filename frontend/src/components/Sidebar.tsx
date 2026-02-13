'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

type SidebarProps = {
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  user: User;
  onSignOut: () => void;
};

export default function Sidebar({ currentId, onSelect, onNewChat, user, onSignOut }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [currentId, user.id]);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await createClient().auth.getSession();
      const response = await fetch('http://localhost:8000/conversations', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
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
    <nav className="w-64 h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800 shadow-2xl" aria-label="Conversation History">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm shadow-inner" aria-hidden="true">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 truncate">
          <p className="text-xs font-black truncate uppercase tracking-tighter text-blue-100">{user.email}</p>
          <button 
            onClick={onSignOut}
            className="text-[10px] text-gray-400 hover:text-red-400 focus:text-red-400 transition-colors uppercase font-black tracking-widest outline-none"
            aria-label="Sign out of your account"
          >
            Terminal Logout
          </button>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 outline-none"
        >
          <span className="text-lg" aria-hidden="true">+</span> New Inquiry
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-800">
        <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 mt-2">
          Intelligence Log
        </h3>
        <div className="space-y-1">
          {isLoading ? (
            <div className="px-4 py-2 text-xs text-gray-500 font-bold uppercase animate-pulse">Scanning records...</div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-2 text-xs text-gray-500 font-bold uppercase italic">No active briefings</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-4 py-3 text-xs rounded-xl truncate transition-all outline-none ${
                  currentId === conv.id
                    ? 'bg-blue-600 text-white font-black shadow-md border-l-4 border-blue-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white font-bold'
                }`}
                aria-current={currentId === conv.id ? 'true' : undefined}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 text-[9px] text-gray-600 text-center font-black tracking-[0.4em] uppercase">
        COSINT STRATEGIC v1.0
      </div>
    </nav>
  );
}
