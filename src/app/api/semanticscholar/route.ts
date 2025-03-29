import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'paper/search';
    
    // Remove the endpoint parameter and keep the rest
    searchParams.delete('endpoint');
    
    const url = `${BASE_URL}/${endpoint}?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': `Research Hypothesis Checker (mailto:${CONTACT_EMAIL})`
      },
    });

    if (response.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few seconds.' },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Semantic Scholar API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Semantic Scholar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Semantic Scholar API' },
      { status: 500 }
    );
  }
} 