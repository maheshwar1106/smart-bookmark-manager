import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  // If there's an error, redirect to login
  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  if (code) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(new URL('/login?error=session_failed', request.url));
      }
    } catch (err) {
      console.error('Unexpected error during auth callback:', err);
      return NextResponse.redirect(new URL('/login?error=unexpected_error', request.url));
    }
  }

  // Redirect to bookmarks page after successful authentication
  return NextResponse.redirect(new URL('/bookmarks', request.url));
}
