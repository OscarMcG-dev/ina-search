import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Check if API key is loaded
  const apiKey = process.env.RESEND_API_KEY;
  
  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyFirstFive: apiKey ? apiKey.substring(0, 5) : null,
    allEnvKeys: Object.keys(process.env).filter(key => 
      !key.includes('NODE') && 
      !key.includes('npm')
    ),
  });
} 