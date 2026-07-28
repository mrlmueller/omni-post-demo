import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '../../../lib/admin/firebaseAdmin';
import { isAdminUser } from '../../../lib/admin/adminConfig';

export async function POST(request: NextRequest) {
  try {
    // Get Firebase Admin instances
    const { admin, firestore, auth } = getFirebaseAdmin();
    
    // 1. Validate token and check admin status
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

    // 2. Check if user is the admin (using environment variable)
    if (!isAdminUser(decodedToken.uid)) {
      console.warn(`Unauthorized admin attempt by user: ${decodedToken.uid}`);
      return NextResponse.json({ error: 'Forbidden - Not authorized' }, { status: 403 });
    }

    // 3. Get request body
    const body = await request.json();
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json({ error: 'Bad Request - Missing feedbackId' }, { status: 400 });
    }

    // 4. Delete the feedback item
    await firestore
      .collection('feedback')
      .doc(feedbackId)
      .delete();

    // 5. Delete associated votes (optional, but good for cleanup)
    const votesSnapshot = await firestore
      .collection('votes')
      .where('postId', '==', feedbackId)
      .get();

    const batch = firestore.batch();
    votesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (votesSnapshot.docs.length > 0) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true,
      message: `Feedback item deleted` 
    });
    
  } catch (error) {
    console.error('Error deleting feedback item:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: (error as Error).message
    }, { status: 500 });
  }
}