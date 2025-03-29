import { NextRequest, NextResponse } from 'next/server';
import { sendPaperToOneNote } from '@/lib/email-service';
import type { Work } from '@/lib/openalex';

// Validate that the request has a valid API key (if you want to add this)
// const validateRequest = (req: NextRequest) => {
//   const authHeader = req.headers.get('authorization');
//   return authHeader && authHeader === `Bearer ${process.env.INTERNAL_API_KEY}`;
// };

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { paper, email } = body;

    // Validate required fields
    if (!paper || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: paper and email' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!email.includes('@') || email.length < 5) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send the paper to OneNote via email
    const result = await sendPaperToOneNote(paper as Work, email);

    if (!result.success) {
      console.error('Send email error:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    // Return success response, including any note about the email used
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      note: result.note,
      data: result.data 
    });
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.error('Error in send-to-onenote API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
} 