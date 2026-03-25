// ============================================
// Image Upload API - Supabase Storage
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { randomUUID } from 'crypto';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);
const TYPE_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

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

    // --- Validate MIME type ---
    if (!ALLOWED_TYPES.has(file.type)) {
      return json(
        { error: `File type "${file.type}" is not allowed. Accepted: PNG, JPEG, WebP, GIF, MP4, WebM.` },
        { status: 400 }
      );
    }

    // --- Validate file size (type-aware) ---
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const limitMB = maxSize / 1024 / 1024;
      return json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum for ${isVideo ? 'video' : 'images'} is ${limitMB} MB.` },
        { status: 400 }
      );
    }

    // Derive extension from validated MIME type (never trust client filename)
    const ext = TYPE_TO_EXT[file.type] || 'bin';
    const fileName = `${Date.now()}-${randomUUID()}.${ext}`;

    // Path: userId/fileName (for RLS policies)
    const filePath = userId ? `${userId}/${fileName}` : `anonymous/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('[Upload] Supabase upload error:', uploadError);
      return json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filePath);

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
