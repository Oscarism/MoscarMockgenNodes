// ============================================
// MOSCAR - Image Host Service
// Handles image uploading to cloud storage
// ============================================

import { get } from 'svelte/store';
import { user, isLoggedIn } from '$lib/stores/auth';

/**
 * Upload image to Supabase Storage (for logged-in users)
 */
async function uploadToSupabase(file: File): Promise<string> {
  const currentUser = get(user);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', currentUser?.id || '');

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  console.log('[ImageHost] Supabase upload success:', result.publicUrl);
  return result.publicUrl;
}

/**
 * Upload image to Litterbox (fallback for anonymous users)
 * Files expire after 1 hour
 */
async function uploadToLitterbox(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('time', '1h'); // 1 hour expiry
  formData.append('fileToUpload', file);

  const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Litterbox upload failed');
  }

  const url = await response.text();
  console.log('[ImageHost] Litterbox upload success:', url.trim());
  return url.trim();
}

/**
 * Smart upload - uses Supabase if logged in, Litterbox if not
 * Returns the publicly accessible URL of the uploaded image
 */
export async function uploadImageToHost(file: File): Promise<string> {
  const loggedIn = get(isLoggedIn);
  
  if (loggedIn) {
    try {
      return await uploadToSupabase(file);
    } catch (error) {
      console.warn('[ImageHost] Supabase upload failed, falling back to Litterbox:', error);
      return await uploadToLitterbox(file);
    }
  } else {
    return await uploadToLitterbox(file);
  }
}

/**
 * Validate an image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload JPEG, PNG, or WebP images only' };
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be under 10MB' };
  }

  return { valid: true };
}
