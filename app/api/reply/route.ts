import { NextRequest, NextResponse } from 'next/server';
import adminDb from '@/lib/firebaseAdmin';
import { ref, update, serverTimestamp } from 'firebase/database';

export async function POST(req: NextRequest) {
  try {
    // Validasi Password
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, reply } = await req.json();

    if (!messageId || !reply) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const messageRef = ref(adminDb, `messages/${messageId}`);
    
    await update(messageRef, {
      reply: reply,
      repliedAt: serverTimestamp(),
      status: 'replied'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
