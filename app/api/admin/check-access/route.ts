import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '../../../lib/admin/firebaseAdmin';
import { isAdminUser } from '../../../lib/admin/adminConfig';

export async function POST(request: NextRequest) {
  try {
    // Get Firebase Admin instances
    const { auth } = getFirebaseAdmin();
    
    // 1. Validate token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // 2. Check if user is the admin
    if (!isAdminUser(decodedToken.uid)) {
      console.warn(`Unauthorized admin access attempt by user: ${decodedToken.uid}`);
      return NextResponse.json({ error: 'Forbidden - Not authorized' }, { status: 403 });
    }

    // 3. If we got here, user is authorized
    return NextResponse.json({ 
      success: true,
      message: 'Access granted'
    });
    
  } catch (error) {
    console.error('Error checking admin access:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: (error as Error).message
    }, { status: 500 });
  }
}