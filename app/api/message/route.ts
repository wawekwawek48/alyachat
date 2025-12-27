import { NextRequest, NextResponse } from 'next/server';
import adminDb from '@/lib/firebaseAdmin';
import { push, ref, serverTimestamp } from 'firebase/database';

export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const messagesRef = ref(adminDb, 'messages');
    const newMessageRef = push(messagesRef);
    
    const newMessageData = {
      name: name || 'Anonim',
      message: message,
      createdAt: serverTimestamp(),
      reply: null,
      repliedAt: null,
      status: 'pending'
    };

    await newMessageRef.set(newMessageData);

    return NextResponse.json({ success: true, messageId: newMessageRef.key });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
