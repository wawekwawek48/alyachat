'use client';
import { useState, useEffect } from 'react';
import db from '@/lib/firebaseClient';
import { ref, onValue } from 'firebase/database';
import { Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function MessageForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  
  // Real-time listener untuk pesan terakhir yang dikirim user ini
  const [msgStatus, setMsgStatus] = useState<any>(null);

  useEffect(() => {
    if (lastMessageId) {
      const statusRef = ref(db, `messages/${lastMessageId}`);
      const unsubscribe = onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        setMsgStatus(data);
      });
      return () => unsubscribe();
    }
  }, [lastMessageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setLastMessageId(data.messageId);
        setName('');
        setMessage('');
      }
    } catch (error) {
      alert('Gagal mengirim pesan');
    } finally {
      setLoading(false);
    }
  };

  if (success && lastMessageId && msgStatus) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10 text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Pesan Terkirim!</h2>
        <p className="text-gray-600 mb-4">Terima kasih, {msgStatus.name}. Pesan Anda sedang diproses.</p>
        
        {/* Status Card */}
        <div className="bg-gray-50 p-4 rounded-lg text-left border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {msgStatus.status === 'pending' ? (
              <><Clock className="w-4 h-4 text-yellow-500" /><span className="text-sm font-medium text-yellow-700">Menunggu Balasan</span></>
            ) : (
              <><CheckCircle className="w-4 h-4 text-blue-500" /><span className="text-sm font-medium text-blue-700">Sudah Dibalas</span></>
            )}
          </div>
          
          <p className="text-sm text-gray-800 italic">"{msgStatus.message}"</p>
          
          {msgStatus.reply && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
              <p className="text-xs font-bold text-blue-800 uppercase mb-1">Balasan Owner:</p>
              <p className="text-sm text-blue-900">{msgStatus.reply}</p>
            </div>
          )}
        </div>

        <button onClick={() => setSuccess(false)} className="mt-6 text-sm text-blue-600 hover:underline">
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10 border border-gray-100">
      <div className="flex items-center justify-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Hubungi Owner</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama (Opsional)</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
          <textarea 
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Tulis pesan Anda disini..."
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Mengirim...' : <><Send className="w-4 h-4" /> Kirim Pesan</>}
        </button>
      </form>
    </div>
  );
  }
