// ============================================
// Image Upload API - Supabase Storage
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Create admin client for server-side uploads
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

try {
  if (PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
} catch (e) {
  console.error('[Upload] Failed to create Supabase admin client:', e);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[Upload] Supabase admin client not configured');
      return json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[Upload] Uploading file: ${file.name}, size: ${file.size}, userId: ${userId || 'anonymous'}`);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomId}.${ext}`;
    
    // Path: userId/fileName (for RLS policies)
    const filePath = userId ? `${userId}/${fileName}` : `anonymous/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('[Upload] Supabase upload error:', uploadError);
      return json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filePath);

    console.log(`[Upload] Success: ${filePath} -> ${urlData.publicUrl}`);

    return json({
      success: true,
      filePath,
      publicUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
};
