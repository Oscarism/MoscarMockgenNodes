// ============================================
// Database Service - Supabase Operations
// ============================================

import { supabase, isSupabaseConfigured } from '$lib/supabase';
import type { GenerationRecord, AspectRatio } from '$lib/types';

export interface DbGeneration {
  id: string;
  user_id: string;
  prompt: string;
  enhanced_prompt: string | null;
  model: string;
  aspect_ratio: string | null;
  quality: string | null;
  resolution: string | null;
  task_id: string | null;
  state: string;
  result_urls: string[] | null;
  error_message: string | null;
  created_at: string;
}

/** Standardized result type for mutation operations */
export interface DbResult<T = void> {
  data: T | null;
  error: string | null;
}

/**
 * Save a generation record to the database
 */
export async function saveGeneration(
  userId: string,
  record: GenerationRecord,
  enhancedPrompt?: string | null
): Promise<DbResult<string>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        prompt: record.prompt,
        enhanced_prompt: enhancedPrompt || null,
        model: record.model || 'unknown',
        aspect_ratio: record.aspectRatio,
        quality: record.quality,
        task_id: record.taskId,
        state: record.state || 'waiting',
        result_urls: record.resultUrls || null,
        error_message: null
      })
      .select('id')
      .single();

    if (error) {
      console.error('[DB] Failed to save generation:', error);
      return { data: null, error: error.message };
    }

    return { data: data.id, error: null };
  } catch (err) {
    console.error('[DB] Save error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Update a generation record with results (by task_id)
 */
export async function updateGeneration(
  taskId: string,
  state: string,
  resultUrls?: string[],
  errorMessage?: string
): Promise<DbResult> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };

  try {
    const updates: Record<string, any> = { state };
    if (resultUrls) updates.result_urls = resultUrls;
    if (errorMessage) updates.error_message = errorMessage;

    const { error } = await supabase
      .from('generations')
      .update(updates)
      .eq('task_id', taskId);

    if (error) {
      console.error('[DB] Failed to update generation:', error);
      return { data: null, error: error.message };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('[DB] Update error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Load user's generation history
 */
export async function loadGenerationHistory(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<GenerationRecord[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[DB] Failed to load history:', error);
      return [];
    }

    // Convert DB records to GenerationRecord format
    const records: GenerationRecord[] = (data || []).map((row: DbGeneration) => ({
      id: row.id,
      timestamp: new Date(row.created_at).getTime(),
      prompt: row.prompt,
      aspectRatio: (row.aspect_ratio || '1:1') as AspectRatio,
      quality: (row.quality || 'basic') as 'basic' | 'high',
      taskId: row.task_id || row.id,
      state: row.state as 'waiting' | 'success' | 'fail',
      model: row.model,
      resultUrls: row.result_urls || undefined,
      errorMessage: row.error_message || undefined
    }));

    return records;
  } catch (error) {
    console.error('[DB] Load error:', error);
    return [];
  }
}

/**
 * Delete a generation record
 */
export async function deleteGeneration(generationId: string): Promise<DbResult> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };

  try {
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId);

    if (error) {
      console.error('[DB] Failed to delete generation:', error);
      return { data: null, error: error.message };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('[DB] Delete error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================
// Hidden Images (User Settings)
// ============================================

/**
 * Save hidden image URLs to user settings
 */
export async function saveHiddenImages(userId: string, hiddenUrls: string[]): Promise<DbResult> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };

  try {
    // Use upsert to create or update user settings
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        hidden_images: hiddenUrls,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('[DB] Failed to save hidden images:', error);
      return { data: null, error: error.message };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('[DB] Save hidden images error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Load hidden image URLs from user settings
 */
export async function loadHiddenImages(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('hidden_images')
      .eq('user_id', userId)
      .single();

    if (error) {
      // No settings yet - not an error, just empty
      if (error.code === 'PGRST116') {
        return [];
      }
      console.error('[DB] Failed to load hidden images:', error);
      return [];
    }

    const hiddenUrls = data?.hidden_images || [];
    return hiddenUrls;
  } catch (error) {
    console.error('[DB] Load hidden images error:', error);
    return [];
  }
}
