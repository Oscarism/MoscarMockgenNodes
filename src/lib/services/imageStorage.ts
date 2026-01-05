// ============================================
// Image Storage Service - Supabase Storage
// Downloads images from temp URLs and uploads to permanent storage
// ============================================

import { supabase, isSupabaseConfigured } from '$lib/supabase';

const BUCKET_NAME = 'generations';

/**
 * Upload an image from a temporary URL to Supabase Storage
 * Images are stored in user-specific folders: {userId}/{timestamp}_{random}.webp
 * 
 * @param tempUrl - The temporary URL from Kie AI
 * @param userId - The authenticated user's ID
 * @returns The permanent public URL from Supabase Storage (or original URL on failure)
 */
export async function uploadToSupabaseStorage(
  tempUrl: string,
  userId: string
): Promise<string> {
  if (!isSupabaseConfigured) {
    console.log('[ImageStorage] Supabase not configured, returning original URL');
    return tempUrl; // Fallback to temp URL
  }

  try {
    console.log(`[ImageStorage] Downloading image from: ${tempUrl.substring(0, 50)}...`);
    
    // Download the image from the temp URL
    const response = await fetch(tempUrl);
    if (!response.ok) {
      console.error(`[ImageStorage] Failed to download image: ${response.status}`);
      return tempUrl; // Fallback to temp URL
    }

    const blob = await response.blob();
    
    // Generate unique filename with user folder
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const extension = tempUrl.includes('.png') ? 'png' : 'webp';
    const filePath = `${userId}/${timestamp}_${randomId}.${extension}`;

    console.log(`[ImageStorage] Uploading to: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/webp',
        upsert: false
      });

    if (error) {
      console.error('[ImageStorage] Upload failed:', error.message);
      return tempUrl; // Fallback to temp URL
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log(`[ImageStorage] Uploaded successfully: ${urlData.publicUrl}`);
    return urlData.publicUrl;

  } catch (error) {
    console.error('[ImageStorage] Error:', error);
    return tempUrl; // Fallback to temp URL on any error
  }
}

/**
 * Upload multiple images to Supabase Storage
 * Processes images in parallel for speed
 * 
 * @param tempUrls - Array of temporary URLs from Kie AI
 * @param userId - The authenticated user's ID
 * @returns Array of permanent URLs (some may be original temp URLs on failure)
 */
export async function uploadMultipleToStorage(
  tempUrls: string[],
  userId: string
): Promise<string[]> {
  if (!isSupabaseConfigured || !userId) {
    console.log('[ImageStorage] Returning original URLs (no Supabase or no user)');
    return tempUrls;
  }

  console.log(`[ImageStorage] Uploading ${tempUrls.length} images for user ${userId}`);
  
  // Upload all images in parallel
  const uploadPromises = tempUrls.map(url => uploadToSupabaseStorage(url, userId));
  const results = await Promise.all(uploadPromises);
  
  console.log(`[ImageStorage] Completed uploading ${results.length} images`);
  return results;
}
