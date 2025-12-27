import { NextRequest, NextResponse } from 'next/server';
import adminDb from '@/lib/firebaseAdmin';
import { get, ref } from 'firebase/database';

export async function GET(req: NextRequest) {
  try {
    // Validasi Password Sederhana
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messagesRef = ref(adminDb, 'messages');
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
      return NextResponse.json([]);
    }

    const data = snapshot.val();
    // Transform object ke array
    const messagesArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    // Sort by createdAt descending
    messagesArray.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(messagesArray);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
