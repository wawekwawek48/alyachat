'use client';
import { useState, useEffect } from 'react';
import { Lock, LogOut, MessageSquare, Reply, Check, Clock } from 'lucide-react';

type Message = {
  id: string;
  name: string;
  message: string;
  createdAt: number;
  reply: string | null;
  status: 'pending' | 'replied';
};

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fungsi Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Di real app, ini harusnya server action, tapi untuk demo simple kita simpan token di session storage
    // Di sini kita coba fetch endpoint yang butuh auth
    fetchMessages(password);
  };

  const fetchMessages = async (pwd: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${pwd}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setIsAuthenticated(true);
        // Simpan token di session storage agar persist saat refresh (opsional, tidak disarankan untuk production security tinggi)
        sessionStorage.setItem('admin_token', pwd);
      } else {
        alert('Password salah!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cek session saat load (opsional)
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      setPassword(token);
      fetchMessages(token);
    }
  }, []);

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    
    const res = await fetch('/api/reply', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`
      },
      body: JSON.stringify({ messageId, reply: replyText }),
    });

    if (res.ok) {
      setReplyingTo(null);
      setReplyText('');
      // Refresh data
      fetchMessages(password);
    } else {
      alert('Gagal membalas');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto mt-20 bg-white p-8 rounded-lg shadow-md text-center border border-gray-100">
        <Lock className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            placeholder="Masukkan Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition">
            Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Inbox Owner
        </h1>
        <button 
          onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin_token'); }}
          className="text-sm text-red-600 hover:underline flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="grid gap-4">
        {messages.length === 0 && <p className="text-center text-gray-500">Belum ada pesan.</p>}
        
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{msg.name}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                msg.status === 'replied' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {msg.status === 'replied' ? 'Sudah Dibalas' : 'Menunggu'}
              </span>
            </div>
            
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md my-3 text-sm">
              {msg.message}
            </p>

            {msg.reply && (
              <div className="border-l-4 border-blue-500 pl-3 mt-2">
                <p className="text-xs font-bold text-blue-600 mb-1">Balasan Anda:</p>
                <p className="text-sm text-gray-600 italic">{msg.reply}</p>
              </div>
            )}

            {replyingTo === msg.id ? (
              <div className="mt-4 space-y-2">
                <textarea 
                  className="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  rows={2}
                  placeholder="Tulis balasan..."
                  defaultValue={msg.reply || ''}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => handleReply(msg.id)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" /> Kirim
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setReplyingTo(msg.id); setReplyText(msg.reply || ''); }}
                className="mt-3 text-xs flex items-center gap-1 text-blue-600 hover:underline"
              >
                <Reply className="w-3 h-3" /> {msg.reply ? 'Edit Balasan' : 'Balas'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
