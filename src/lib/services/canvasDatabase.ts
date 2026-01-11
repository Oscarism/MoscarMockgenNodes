// ============================================
// Canvas Database Service - Supabase Operations
// ============================================

import { supabase, isSupabaseConfigured } from '$lib/supabase';
import type { PromptNode, PromptEdge } from '$lib/types';

export interface DbCanvas {
  id: string;
  user_id: string;
  name: string;
  nodes: PromptNode[];
  edges: PromptEdge[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanvasSummary {
  id: string;
  name: string;
  nodeCount: number;
  updatedAt: Date;
  isDefault: boolean;
}

/**
 * Save a canvas to the database
 */
export async function saveCanvas(
  userId: string,
  name: string,
  nodes: PromptNode[],
  edges: PromptEdge[],
  canvasId?: string
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.log('[Canvas DB] Supabase not configured, skipping save');
    return null;
  }

  try {
    if (canvasId) {
      // Update existing canvas
      const { error } = await supabase
        .from('canvases')
        .update({
          name,
          nodes,
          edges
        })
        .eq('id', canvasId)
        .eq('user_id', userId);

      if (error) {
        console.error('[Canvas DB] Failed to update canvas:', error);
        return null;
      }

      console.log('[Canvas DB] Canvas updated:', canvasId);
      return canvasId;
    } else {
      // Insert new canvas
      const { data, error } = await supabase
        .from('canvases')
        .insert({
          user_id: userId,
          name,
          nodes,
          edges
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Canvas DB] Failed to save canvas:', error);
        return null;
      }

      console.log('[Canvas DB] Canvas saved:', data.id);
      return data.id;
    }
  } catch (error) {
    console.error('[Canvas DB] Save error:', error);
    return null;
  }
}

/**
 * Load a specific canvas
 */
export async function loadCanvas(canvasId: string): Promise<DbCanvas | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('id', canvasId)
      .single();

    if (error) {
      console.error('[Canvas DB] Failed to load canvas:', error);
      return null;
    }

    return data as DbCanvas;
  } catch (error) {
    console.error('[Canvas DB] Load error:', error);
    return null;
  }
}

/**
 * Load user's most recent canvas (or default)
 */
export async function loadLatestCanvas(userId: string): Promise<DbCanvas | null> {
  if (!isSupabaseConfigured) return null;

  try {
    // First try to find default canvas
    let { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    // If no default, get most recent
    if (!data || error) {
      const result = await supabase
        .from('canvases')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[Canvas DB] Failed to load latest canvas:', error);
      return null;
    }

    return data as DbCanvas | null;
  } catch (error) {
    console.error('[Canvas DB] Load latest error:', error);
    return null;
  }
}

/**
 * List all user's canvases
 */
export async function listCanvases(userId: string): Promise<CanvasSummary[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('canvases')
      .select('id, name, nodes, is_default, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Canvas DB] Failed to list canvases:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      nodeCount: Array.isArray(row.nodes) ? row.nodes.length : 0,
      updatedAt: new Date(row.updated_at),
      isDefault: row.is_default
    }));
  } catch (error) {
    console.error('[Canvas DB] List error:', error);
    return [];
  }
}

/**
 * Delete a canvas
 */
export async function deleteCanvas(canvasId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('canvases')
      .delete()
      .eq('id', canvasId);

    if (error) {
      console.error('[Canvas DB] Failed to delete canvas:', error);
      return false;
    }

    console.log('[Canvas DB] Canvas deleted:', canvasId);
    return true;
  } catch (error) {
    console.error('[Canvas DB] Delete error:', error);
    return false;
  }
}

/**
 * Set a canvas as default
 */
export async function setDefaultCanvas(userId: string, canvasId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    // Clear existing default
    await supabase
      .from('canvases')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set new default
    const { error } = await supabase
      .from('canvases')
      .update({ is_default: true })
      .eq('id', canvasId);

    if (error) {
      console.error('[Canvas DB] Failed to set default:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Canvas DB] Set default error:', error);
    return false;
  }
}

// ============================================
// Preset Canvases (Public Templates)
// ============================================

export interface PresetCanvasSummary {
  id: string;
  name: string;
  description: string | null;
  category: string;
  nodeCount: number;
}

/**
 * List all preset canvas templates
 */
export async function listPresetCanvases(): Promise<PresetCanvasSummary[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('preset_canvases')
      .select('id, name, description, category, nodes')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[Canvas DB] Failed to list presets:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      nodeCount: Array.isArray(row.nodes) ? row.nodes.length : 0
    }));
  } catch (error) {
    console.error('[Canvas DB] List presets error:', error);
    return [];
  }
}

/**
 * Load a preset canvas by ID
 */
export async function loadPresetCanvas(presetId: string): Promise<DbCanvas | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('preset_canvases')
      .select('*')
      .eq('id', presetId)
      .single();

    if (error) {
      console.error('[Canvas DB] Failed to load preset:', error);
      return null;
    }

    // Convert preset to DbCanvas format
    return {
      id: data.id,
      user_id: '',
      name: data.name,
      nodes: data.nodes || [],
      edges: data.edges || [],
      is_default: false,
      created_at: data.created_at,
      updated_at: data.created_at
    } as DbCanvas;
  } catch (error) {
    console.error('[Canvas DB] Load preset error:', error);
    return null;
  }
}

