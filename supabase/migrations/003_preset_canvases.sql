-- ============================================
-- Preset Canvases - Sample/Template Node Configurations
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- PRESET_CANVASES TABLE
-- Stores sample canvas templates for all users
-- ============================================
CREATE TABLE IF NOT EXISTS preset_canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_preset_canvases_category ON preset_canvases(category);
CREATE INDEX IF NOT EXISTS idx_preset_canvases_sort ON preset_canvases(sort_order);

-- No RLS on presets - they are public/readable by everyone
-- Only admins can insert/update/delete via Supabase dashboard
