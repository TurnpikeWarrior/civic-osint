'use client';

import { useState } from 'react';
import Chat from '@/components/Chat';
import Header from '@/components/Header';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ user }: { user: User }) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans selection:bg-blue-100 overflow-hidden text-black">
      <Header user={user} onSignOut={handleSignOut} />
      
      {/* Spacer for fixed header */}
      <div className="h-16 shrink-0" />

      <main className="flex-1 flex items-center justify-center p-6 relative bg-gray-50/30">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.02]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black tracking-tighter text-blue-900 select-none">
            COSINT
          </div>
        </div>

        <div className="z-10 w-full max-w-2xl flex flex-col items-center justify-center">
          {/* Subtle Welcome Tag */}
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
            Secure Intel Node Active
          </div>

          {/* Centered Chat - perfectly positioned */}
          <div className="w-full transition-all duration-700 hover:scale-[1.01] flex justify-center">
            <Chat 
              mode="centered"
              conversationId={currentConversationId} 
              onIdGenerated={setCurrentConversationId}
              user={user}
            />
          </div>

          {/* Minimal Status Indicators below chat */}
          <div className="mt-6 flex justify-center gap-8 w-full">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Source</span>
              <span className="text-[10px] font-bold text-black border-b border-blue-600 pb-0.5">Congress API v3</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Engine</span>
              <span className="text-[10px] font-bold text-black border-b border-blue-600 pb-0.5">Neural Core 4.0</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center bg-white border-t border-gray-50">
        <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">
          Strategic Terminal &bull; Protocol v1.0.42 &bull; Secure Session
        </p>
      </footer>
    </div>
  );
}
