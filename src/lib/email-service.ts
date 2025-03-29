import { Resend } from 'resend';
import type { Work } from './openalex';

// Don't initialize Resend at the module level in Edge Runtime
// This will be done inside the function instead

/**
 * Formats a research paper into a clean HTML email
 */
function formatPaperEmailContent(paper: Work): string {
  // Use safe accessors to prevent errors with undefined properties
  const title = paper.title || 'Untitled Research Paper';
  const year = paper.publication_year || 'Unknown Year';
  const citations = paper.cited_by_count || 0;
  const authors = paper.authorships?.map(a => a.author.display_name).join(', ') || 'Unknown authors';
  const doi = paper.doi || '';
  const abstract = paper.abstract || '';
  const openAccessUrl = paper.open_access_url || '';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .metadata { color: #555; margin-bottom: 20px; }
          .abstract { line-height: 1.6; }
          .links { margin-top: 20px; }
          .links a { display: inline-block; margin-right: 15px; color: #0066cc; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="metadata">
          <p><strong>Authors:</strong> ${authors}</p>
          <p><strong>Year:</strong> ${year}</p>
          <p><strong>Citations:</strong> ${citations}</p>
          ${doi ? `<p><strong>DOI:</strong> ${doi}</p>` : ''}
        </div>
        ${abstract ? `<div class="abstract"><h2>Abstract</h2><p>${abstract}</p></div>` : ''}
        <div class="links">
          ${doi ? `<a href="https://doi.org/${doi}" target="_blank">View on DOI</a>` : ''}
          ${openAccessUrl ? `<a href="${openAccessUrl}" target="_blank">Read Full Paper</a>` : ''}
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends a research paper to OneNote via email
 */
export async function sendPaperToOneNote(paper: Work, recipientEmail: string) {
  try {
    // Initialize Resend inside the function for Edge compatibility
    const resendApiKey = process.env.RESEND_API_KEY;
    const verifiedEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'oscarsmcguire@gmail.com';
    
    if (!resendApiKey || resendApiKey === 'your_resend_api_key_here') {
      console.error('Resend API key is not configured');
      return { 
        success: false, 
        error: 'Email service not configured. Please add a valid Resend API key to your .env file.' 
      };
    }
    
    // Create a new Resend instance with the API key
    const resend = new Resend(resendApiKey);
    
    // Check if the input email matches the verified email
    const emailMatches = recipientEmail.toLowerCase() === verifiedEmail.toLowerCase();
    
    // We can only send to verified email in free tier
    const actualRecipient = verifiedEmail;
    
    if (!actualRecipient || !actualRecipient.includes('@')) {
      return { 
        success: false, 
        error: 'Contact email is not properly configured.' 
      };
    }
    
    console.log(`Sending email to ${actualRecipient} from Onboarding Resend <onboarding@resend.dev>`);
    
    const data = await resend.emails.send({
      from: 'Onboarding Resend <onboarding@resend.dev>',
      to: [actualRecipient],
      subject: `Research Paper: ${paper.title || 'Untitled Research'}`,
      html: formatPaperEmailContent(paper),
    });
    
    console.log('Email sent successfully:', data);
    
    // If the email doesn't match the verified email, return a helpful message
    if (!emailMatches) {
      return { 
        success: true, 
        data,
        note: `This app is using Resend's free tier which only allows sending to the owner's email (${verifiedEmail}). Your paper was sent there instead of ${recipientEmail}. To use your own email, ask Oscar to upgrade to a paid plan or verify your domain.` 
      };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while sending email';
    return { success: false, error: errorMessage };
  }
} 