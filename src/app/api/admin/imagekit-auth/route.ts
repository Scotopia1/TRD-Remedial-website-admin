import { NextResponse } from 'next/server';
import imagekit from '@/lib/imagekit';

export async function GET() {
  try {
    const authParams = imagekit.helper.getAuthenticationParameters();
    return NextResponse.json({ success: true, data: authParams });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Auth failed' },
      { status: 500 }
    );
  }
}
