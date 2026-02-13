'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Chat from '@/components/Chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type MemberData = {
  details: any;
  bills: any[];
  votes: any[];
};

export default function MemberDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bioguideId = resolvedParams.id;
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [researchNotes, setResearchNotes] = useState<{title: string, content: string}[]>([]);

  const captureIntel = (intel: {title: string, content: string}) => {
    setResearchNotes(prev => {
      if (prev.some(n => n.title === intel.title)) return prev;
      return [...prev, intel];
    });
  };

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);
      
      try {
        const response = await fetch(`http://localhost:8000/member/${bioguideId}`);
        if (!response.ok) throw new Error('Failed to fetch representative details');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [bioguideId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading || !user) return (
    <div className="flex min-h-screen items-center justify-center bg-white" aria-busy="true" aria-label="Loading intelligence data">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !data) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Header user={user} onSignOut={handleSignOut} />
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-gray-200">
        <h2 className="text-2xl font-black text-red-700 mb-4 uppercase tracking-tighter">System Error</h2>
        <p className="text-gray-800 mb-6 font-medium">{error || "Could not retrieve representative intelligence."}</p>
        <Link href="/" className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Return to Terminal
        </Link>
      </div>
    </div>
  );

  const { details, bills, votes } = data;

  return (
    <div className="min-h-screen bg-white pb-12 font-sans selection:bg-blue-100 text-black">
      <Header user={user} onSignOut={handleSignOut} />

      {/* Optimized Horizontal Hero Section - WCAG Compliant */}
      <div className="pt-24 pb-8 border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center gap-10">
          {/* Profile Image */}
          <div className="relative shrink-0">
            {details.depiction?.imageUrl ? (
              <img 
                src={details.depiction.imageUrl} 
                alt={`Official portrait of ${details.directOrderName}`}
                className="w-36 h-36 rounded-2xl border border-gray-300 shadow-md object-cover bg-gray-50"
              />
            ) : (
              <div className="w-36 h-36 rounded-2xl border border-gray-300 shadow-md bg-blue-50 flex items-center justify-center text-5xl font-black text-blue-700" aria-hidden="true">
                {details.lastName?.charAt(0)}
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                details.partyHistory?.[0]?.partyAbbreviation === 'R' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {details.partyHistory?.[0]?.partyName || 'Unknown Party'}
              </span>
              <span className="px-3 py-1 rounded bg-gray-100 border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-700">
                {details.state} {details.terms?.[0]?.district ? `District ${details.terms[0].district}` : 'Senator'}
              </span>
              <span className="px-3 py-1 rounded bg-green-100 border border-green-200 text-xs font-black uppercase tracking-wider text-green-800">
                {details.terms?.[details.terms.length - 1]?.congress}th Congress
              </span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight leading-none text-black">
              {details.directOrderName}
            </h1>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center text-sm font-semibold">
              <a href={details.officialWebsiteUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900 underline focus:ring-2 focus:ring-blue-500 rounded px-1">
                Official Website
              </a>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <span className="text-gray-700">
                HQ: {details.addressInformation?.officeAddress || 'N/A'}
              </span>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <span className="text-gray-700">
                PH: {details.addressInformation?.phoneNumber || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 max-w-7xl mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Research Notebook & Voting Ledger */}
        <div className="lg:col-span-8 space-y-12">
          {/* Research Notebook */}
          <section aria-labelledby="notebook-title">
            <h2 id="notebook-title" className="text-xs font-black text-blue-700 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
              Research Notebook
            </h2>
            {researchNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                {researchNotes.map((note, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all hover:border-blue-300 group focus-within:ring-2 focus-ring-blue-500">
                    <h3 className="text-sm font-black text-black uppercase tracking-widest mb-3 flex justify-between">
                      {note.title}
                      <span className="text-gray-400">#0{index + 1}</span>
                    </h3>
                    <div className="text-base text-gray-900 font-medium leading-relaxed prose prose-sm max-w-none prose-headings:text-black prose-strong:text-black">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center">
                <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Awaiting Chat Intelligence to Populate Notebook</p>
                <p className="text-sm text-gray-500 mt-2">Ask questions in the terminal to pin modular data here</p>
              </div>
            )}
          </section>

          {/* Voting Ledger */}
          <section aria-labelledby="voting-title">
            <div className="flex justify-between items-center mb-6">
              <h2 id="voting-title" className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Voting Ledger
              </h2>
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">Official Roll Call</span>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {votes.length > 0 ? votes.map((v, i) => (
                  <div key={i} className="p-8 hover:bg-gray-50/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">Legislation Record</span>
                        {v.legislationUrl ? (
                          <a href={v.legislationUrl} target="_blank" rel="noreferrer" className="text-xl font-black text-blue-700 hover:text-blue-900 underline underline-offset-4">
                            {v.legislation}
                          </a>
                        ) : (
                          <span className="text-xl font-black text-black">{v.legislation}</span>
                        )}
                      </div>
                      <time className="text-xs font-bold text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(v.date).toISOString().split('T')[0]}
                      </time>
                    </div>
                    <p className="text-lg font-bold text-black leading-tight mb-6 group-hover:translate-x-1 transition-transform">{v.question}</p>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Representative Vote</span>
                        <span className={`text-2xl font-black ${v.vote === 'Yea' ? 'text-green-700' : v.vote === 'Nay' ? 'text-red-700' : 'text-gray-600'}`}>
                          {v.vote.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 border-l border-gray-200 pl-10">
                        <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Final Outcome</span>
                        <span className="text-2xl font-black text-black uppercase">{v.result}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="p-16 text-gray-500 text-sm font-bold uppercase tracking-widest text-center italic">No ledger entries detected.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sponsorship Registry - Optimized Contrast & Size */}
        <div className="lg:col-span-4">
          <section aria-labelledby="registry-title" className="sticky top-24">
            <h2 id="registry-title" className="text-xs font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              Sponsorship Registry
            </h2>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {bills.length > 0 ? bills.map((bill, i) => (
                  <div key={i} className="p-6 hover:bg-gray-50/50 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                        {bill.type}{bill.number}
                      </span>
                      <time className="text-[10px] font-bold text-gray-600 uppercase">
                        Introduced: {bill.introducedDate}
                      </time>
                    </div>
                    <p className="text-sm font-bold text-black leading-snug mb-4">{bill.title}</p>
                    {bill.latestAction && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-700"></div>
                        <span className="text-[9px] uppercase font-black text-blue-800 block mb-1 tracking-widest">Status Update</span>
                        <p className="text-xs text-gray-900 font-semibold leading-relaxed">{bill.latestAction.text}</p>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="p-12 text-gray-500 text-sm font-bold uppercase tracking-widest text-center italic">No active registries found.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating AI Terminal */}
      <Chat 
        mode="floating"
        conversationId={convId}
        onIdGenerated={setConvId}
        user={user}
        initialContext={`The user is currently viewing the profile of ${details.directOrderName} (Bioguide ID: ${bioguideId}). Use this Bioguide ID directly for tools if needed.`}
        onIntelligenceCaptured={captureIntel}
      />
    </div>
  );
}
