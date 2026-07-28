import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '../../../lib/admin/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Get Firebase Admin instances
    const { auth } = getFirebaseAdmin();
    
    // Validate token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      return NextResponse.json({ 
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: (error as Error).message
    }, { status: 500 });
  }
}