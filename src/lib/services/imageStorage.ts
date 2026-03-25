// ============================================
// Image Storage Service - Supabase Storage
// Downloads images from temp URLs and uploads to permanent storage
// ============================================

import { supabase, isSupabaseConfigured } from '$lib/supabase';

const BUCKET_NAME = 'generations';
const MAX_CONCURRENT = 4;

/**
 * Upload an image from a temporary URL to Supabase Storage.
 * Falls back to the temp URL on failure (with console.error).
 */
export async function uploadToSupabaseStorage(
  tempUrl: string,
  userId: string
): Promise<string> {
  if (!isSupabaseConfigured) {
    return tempUrl;
  }

  try {
    const response = await fetch(tempUrl);
    if (!response.ok) {
      console.error('[ImageStorage] Failed to download temp image:', response.status);
      return tempUrl;
    }

    const blob = await response.blob();
    const ext = blob.type === 'image/png' ? 'png' : 'webp';
    const filePath = `${userId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/webp',
        upsert: false
      });

    if (error) {
      console.error('[ImageStorage] Upload failed:', error.message);
      return tempUrl;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('[ImageStorage] Error:', error);
    return tempUrl;
  }
}

/**
 * Upload multiple images with bounded concurrency (max 4 at a time)
 */
export async function uploadMultipleToStorage(
  tempUrls: string[],
  userId: string
): Promise<string[]> {
  if (!isSupabaseConfigured || !userId) {
    return tempUrls;
  }

  const results: string[] = new Array(tempUrls.length);

  for (let i = 0; i < tempUrls.length; i += MAX_CONCURRENT) {
    const batch = tempUrls.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(
      batch.map(url => uploadToSupabaseStorage(url, userId))
    );
    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }
  }

  return results;
}
