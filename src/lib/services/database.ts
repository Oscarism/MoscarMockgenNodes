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

/**
 * Save a generation record to the database
 */
export async function saveGeneration(
  userId: string,
  record: GenerationRecord,
  enhancedPrompt?: string | null
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.log('[DB] Supabase not configured, skipping save');
    return null;
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
      return null;
    }

    console.log('[DB] Generation saved:', data.id);
    return data.id;
  } catch (error) {
    console.error('[DB] Save error:', error);
    return null;
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
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

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
      return false;
    }

    console.log('[DB] Generation updated by task_id:', taskId);
    return true;
  } catch (error) {
    console.error('[DB] Update error:', error);
    return false;
  }
}

/**
 * Load user's generation history
 */
export async function loadGenerationHistory(userId: string): Promise<GenerationRecord[]> {
  if (!isSupabaseConfigured) {
    console.log('[DB] Supabase not configured, returning empty history');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

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

    console.log(`[DB] Loaded ${records.length} generation records`);
    return records;
  } catch (error) {
    console.error('[DB] Load error:', error);
    return [];
  }
}

/**
 * Delete a generation record
 */
export async function deleteGeneration(generationId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId);

    if (error) {
      console.error('[DB] Failed to delete generation:', error);
      return false;
    }

    console.log('[DB] Generation deleted:', generationId);
    return true;
  } catch (error) {
    console.error('[DB] Delete error:', error);
    return false;
  }
}
