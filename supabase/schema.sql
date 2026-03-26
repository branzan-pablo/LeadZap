-- ============================================
-- LeadZap — Database Schema (RESET + RECREATE)
-- Execute no Supabase SQL Editor
-- ============================================

-- ============================================
-- DROP TUDO (ordem inversa por dependencias)
-- ============================================

-- Remover triggers primeiro
DROP TRIGGER IF EXISTS on_organization_created_tags ON organizations;
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON whatsapp_instances;
DROP TRIGGER IF EXISTS set_updated_at ON leads;
DROP TRIGGER IF EXISTS set_updated_at ON users;
DROP TRIGGER IF EXISTS set_updated_at ON organizations;

-- Remover functions (CASCADE para dropar policies dependentes)
DROP FUNCTION IF EXISTS create_default_tags() CASCADE;
DROP FUNCTION IF EXISTS create_default_pipeline() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_org_id() CASCADE;

-- Remover tabelas (ordem inversa de dependencia)
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS whatsapp_instances CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS lead_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================
-- CRIAR TUDO DO ZERO
-- ============================================

-- Habilitar extensoes necessarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELAS
-- ============================================

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'starter',
  max_users integer NOT NULL DEFAULT 1,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_plan_check CHECK (plan IN ('starter', 'pro', 'business'))
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  avatar_url text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'))
);
CREATE INDEX users_organization_id_idx ON users(organization_id);

CREATE TABLE pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  is_won boolean NOT NULL DEFAULT false,
  is_lost boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pipeline_stages_org_position_unique UNIQUE (organization_id, position)
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  pipeline_stage_id uuid NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  company text,
  source text NOT NULL DEFAULT 'manual',
  estimated_value numeric(12,2),
  notes text,
  position integer NOT NULL DEFAULT 0,
  last_interaction_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_source_check CHECK (source IN ('manual', 'whatsapp', 'instagram', 'website', 'referral', 'other'))
);
CREATE UNIQUE INDEX leads_org_phone_unique ON leads(organization_id, phone) WHERE deleted_at IS NULL;
CREATE INDEX leads_org_stage_idx ON leads(organization_id, pipeline_stage_id);
CREATE INDEX leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX leads_org_deleted_idx ON leads(organization_id, deleted_at);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tags_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE lead_tags (
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lead_id, tag_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  whatsapp_message_id text,
  sender_phone text NOT NULL,
  sender_name text,
  content text,
  media_type text,
  is_from_lead boolean NOT NULL DEFAULT true,
  received_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_media_type_check CHECK (media_type IN ('image', 'audio', 'video', 'document') OR media_type IS NULL)
);
CREATE INDEX messages_lead_id_idx ON messages(lead_id);
CREATE UNIQUE INDEX messages_whatsapp_id_unique ON messages(organization_id, whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
CREATE INDEX messages_org_received_idx ON messages(organization_id, received_at DESC);

CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_at timestamptz NOT NULL,
  completed_at timestamptz,
  push_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reminders_user_due_idx ON reminders(user_id, due_at) WHERE completed_at IS NULL;
CREATE INDEX reminders_push_pending_idx ON reminders(due_at) WHERE completed_at IS NULL AND push_sent = false;

CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX attachments_lead_id_idx ON attachments(lead_id);

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activities_type_check CHECK (type IN (
    'lead_created', 'lead_updated', 'lead_moved', 'lead_assigned',
    'lead_deleted', 'note_added', 'tag_added', 'tag_removed',
    'reminder_created', 'reminder_completed',
    'attachment_added', 'attachment_removed', 'message_received'
  ))
);
CREATE INDEX activities_lead_created_idx ON activities(lead_id, created_at DESC);

CREATE TABLE whatsapp_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  instance_name text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'disconnected',
  phone_number text,
  last_connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT whatsapp_status_check CHECK (status IN ('connected', 'disconnected', 'connecting'))
);

CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX push_subscriptions_user_idx ON push_subscriptions(user_id);

CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invites_role_check CHECK (role IN ('admin', 'user'))
);
CREATE UNIQUE INDEX invites_org_email_pending ON invites(organization_id, email) WHERE accepted_at IS NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON whatsapp_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Criar perfil ao registrar no Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Pipeline padrao ao criar organizacao
CREATE OR REPLACE FUNCTION create_default_pipeline()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pipeline_stages (organization_id, name, position, is_default, is_won, is_lost) VALUES
    (NEW.id, 'Novo Lead', 0, true, false, false),
    (NEW.id, 'Conversando', 1, true, false, false),
    (NEW.id, 'Proposta Enviada', 2, true, false, false),
    (NEW.id, 'Fechado', 3, true, true, false),
    (NEW.id, 'Perdido', 4, true, false, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_default_pipeline();

-- Tags padrao ao criar organizacao
CREATE OR REPLACE FUNCTION create_default_tags()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tags (organization_id, name, color) VALUES
    (NEW.id, 'Quente', '#EF4444'),
    (NEW.id, 'Frio', '#3B82F6'),
    (NEW.id, 'Indeciso', '#F59E0B'),
    (NEW.id, 'VIP', '#8B5CF6');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created_tags
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_default_tags();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Habilitar RLS em TODAS as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Helper: obter organization_id do usuario atual
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: verificar se e admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT role = 'admin' FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- organizations
CREATE POLICY "Users can view own org" ON organizations FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "Admins can update own org" ON organizations FOR UPDATE USING (id = get_user_org_id() AND is_admin());

-- users
CREATE POLICY "Users can view org members" ON users FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());

-- pipeline_stages
CREATE POLICY "Users can view org stages" ON pipeline_stages FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Admins can manage stages" ON pipeline_stages FOR ALL USING (organization_id = get_user_org_id() AND is_admin());

-- leads
CREATE POLICY "Users can view assigned leads" ON leads FOR SELECT USING (
  organization_id = get_user_org_id()
  AND deleted_at IS NULL
  AND (assigned_to = auth.uid() OR assigned_to IS NULL OR is_admin())
);
CREATE POLICY "Users can create leads in org" ON leads FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (
  organization_id = get_user_org_id()
  AND (assigned_to = auth.uid() OR is_admin())
);

-- tags
CREATE POLICY "Users can view org tags" ON tags FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can create tags" ON tags FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Admins can manage tags" ON tags FOR UPDATE USING (organization_id = get_user_org_id() AND is_admin());
CREATE POLICY "Admins can delete tags" ON tags FOR DELETE USING (organization_id = get_user_org_id() AND is_admin());

-- lead_tags
CREATE POLICY "Users can view lead tags" ON lead_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_tags.lead_id AND leads.organization_id = get_user_org_id())
);
CREATE POLICY "Users can manage lead tags" ON lead_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_tags.lead_id AND leads.organization_id = get_user_org_id()
    AND (leads.assigned_to = auth.uid() OR is_admin()))
);

-- messages
CREATE POLICY "Users can view lead messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = messages.lead_id AND leads.organization_id = get_user_org_id()
    AND (leads.assigned_to = auth.uid() OR leads.assigned_to IS NULL OR is_admin()))
);

-- reminders
CREATE POLICY "Users can view own reminders" ON reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own reminders" ON reminders FOR INSERT WITH CHECK (user_id = auth.uid() AND organization_id = get_user_org_id());
CREATE POLICY "Users can update own reminders" ON reminders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reminders" ON reminders FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- attachments
CREATE POLICY "Users can view lead attachments" ON attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = attachments.lead_id AND leads.organization_id = get_user_org_id()
    AND (leads.assigned_to = auth.uid() OR leads.assigned_to IS NULL OR is_admin()))
);
CREATE POLICY "Users can upload to own leads" ON attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = attachments.lead_id AND leads.organization_id = get_user_org_id()
    AND (leads.assigned_to = auth.uid() OR is_admin()))
);
CREATE POLICY "Users can delete own uploads" ON attachments FOR DELETE USING (uploaded_by = auth.uid() OR is_admin());

-- activities
CREATE POLICY "Users can view lead activities" ON activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = activities.lead_id AND leads.organization_id = get_user_org_id()
    AND (leads.assigned_to = auth.uid() OR leads.assigned_to IS NULL OR is_admin()))
);

-- whatsapp_instances
CREATE POLICY "Admins can view instance" ON whatsapp_instances FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Admins can manage instance" ON whatsapp_instances FOR ALL USING (organization_id = get_user_org_id() AND is_admin());

-- push_subscriptions
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions FOR ALL USING (user_id = auth.uid());

-- invites
CREATE POLICY "Admins can view org invites" ON invites FOR SELECT USING (organization_id = get_user_org_id() AND is_admin());
CREATE POLICY "Admins can create invites" ON invites FOR INSERT WITH CHECK (organization_id = get_user_org_id() AND is_admin());
CREATE POLICY "Admins can delete invites" ON invites FOR DELETE USING (organization_id = get_user_org_id() AND is_admin());

-- ============================================
-- STORAGE (configurar manualmente no Dashboard)
-- ============================================
-- 1. Criar bucket "attachments" (private, 5MB limit)
-- 2. Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
-- 3. Storage policies:
--    SELECT: authenticated, path starts with org_{user_org_id}/
--    INSERT: authenticated, path starts with org_{user_org_id}/, file size <= 5MB
--    DELETE: authenticated, path starts with org_{user_org_id}/
