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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint = 'paper/search', ...params } = body;
    
    let url: string;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': `Research Hypothesis Checker (mailto:${CONTACT_EMAIL || ''})`
    };
    
    let requestOptions: RequestInit = {
      headers
    };
    
    if (endpoint.includes('paper/search')) {
      // For search endpoints, build a query string from params
      const searchParams = new URLSearchParams();
      
      // Add all parameters to the search params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'fields' && typeof value === 'string') {
            // Fields should be a comma-separated list with no spaces
            searchParams.append(key, value);
          } else if (Array.isArray(value)) {
            // Handle array parameters
            value.forEach(v => {
              if (v !== undefined && v !== null) {
                searchParams.append(key, String(v));
              }
            });
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      
      // Special handling for pagination - ensure offset is a number
      if (params.offset !== undefined) {
        // Remove potentially duplicate entry
        searchParams.delete('offset');
        // Add as a number
        searchParams.append('offset', String(Number(params.offset)));
      }
      
      // Special handling for limit - ensure it's a number
      if (params.limit !== undefined) {
        // Remove potentially duplicate entry
        searchParams.delete('limit');
        // Add as a number
        searchParams.append('limit', String(Number(params.limit)));
      }
      
      // Special handling for year filter
      if (params.year !== undefined) {
        searchParams.delete('year');
        searchParams.append('year', String(params.year));
      }
      
      // Special handling for minCitationCount
      if (params.minCitationCount !== undefined) {
        searchParams.delete('minCitationCount');
        searchParams.append('minCitationCount', String(Number(params.minCitationCount)));
      }
      
      // Special handling for openAccessPdf
      if (params.openAccessPdf !== undefined) {
        searchParams.delete('openAccessPdf');
        searchParams.append('openAccessPdf', String(params.openAccessPdf));
      }
      
      url = `${BASE_URL}/${endpoint}?${searchParams.toString()}`;
      console.log('GET request to Semantic Scholar API:', url);
      
      // Use GET method for search endpoints
      requestOptions.method = 'GET';
    } else {
      // For other endpoints that might require POST, structure accordingly
      url = `${BASE_URL}/${endpoint}`;
      console.log('POST request to Semantic Scholar API:', url, 'with body:', params);
      
      requestOptions.method = 'POST';
      headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(params);
    }
    
    // Logging the request details for easier debugging
    console.log('Request options:', {
      url,
      method: requestOptions.method,
      headers: requestOptions.headers,
      body: endpoint.includes('paper/search') ? null : params
    });
    
    const response = await fetch(url, requestOptions);

    if (response.status === 429) {
      console.warn('Rate limited by Semantic Scholar API');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few seconds.' },
        { status: 429 }
      );
    }

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
        console.error('Error response body (JSON):', errorBody);
      } catch (e) {
        errorBody = await response.text();
        console.error('Error response body (text):', errorBody);
      }
      
      return NextResponse.json(
        { 
          error: `Semantic Scholar API error: ${response.status} ${response.statusText}`,
          details: errorBody 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log a summary of the response for debugging
    console.log('Response summary:', {
      status: response.status,
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasData: data && data.data && Array.isArray(data.data),
      resultCount: data && data.data ? data.data.length : 0,
      offset: data && data.offset,
      total: data && data.total
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Semantic Scholar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Semantic Scholar API', details: String(error) },
      { status: 500 }
    );
  }
} 