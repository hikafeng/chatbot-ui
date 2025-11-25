--------------- MCPS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS mcps (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- OPTIONAL RELATIONSHIPS
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

     --SHARING
    sharing TEXT NOT NULL DEFAULT 'private',

    -- REQUIRED
    description TEXT NOT NULL CHECK (char_length(description) <= 500),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    schema JSONB NOT NULL,
    url TEXT NOT NULL CHECK (char_length(url) <= 1000)
);

-- INDEXES --

CREATE INDEX mcps_user_id_idx ON mcps(user_id);

-- RLS --

ALTER TABLE mcps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own mcps"
    ON mcps
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow view access to non-private mcps"
    ON mcps
    FOR SELECT
    USING (sharing <> 'private');

-- TRIGGERS --

CREATE TRIGGER update_mcps_updated_at
BEFORE UPDATE ON mcps
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

--------------- MCP WORKSPACES ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS mcp_workspaces (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mcp_id UUID NOT NULL REFERENCES mcps(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    PRIMARY KEY(mcp_id, workspace_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX mcp_workspaces_user_id_idx ON mcp_workspaces(user_id);
CREATE INDEX mcp_workspaces_mcp_id_idx ON mcp_workspaces(mcp_id);
CREATE INDEX mcp_workspaces_workspace_id_idx ON mcp_workspaces(workspace_id);

-- RLS --

ALTER TABLE mcp_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own mcp_workspaces"
    ON mcp_workspaces
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_mcp_workspaces_updated_at
BEFORE UPDATE ON mcp_workspaces 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();