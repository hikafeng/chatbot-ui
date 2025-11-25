--------------- ASSISTANT MCPS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS assistant_mcps (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    mcp_id UUID NOT NULL REFERENCES mcps(id) ON DELETE CASCADE,

    PRIMARY KEY(assistant_id, mcp_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX assistant_mcps_user_id_idx ON assistant_mcps(user_id);
CREATE INDEX assistant_mcps_assistant_id_idx ON assistant_mcps(assistant_id);
CREATE INDEX assistant_mcps_mcp_id_idx ON assistant_mcps(mcp_id);

-- RLS --

ALTER TABLE assistant_mcps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own assistant_mcps"
    ON assistant_mcps
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_assistant_mcps_updated_at
BEFORE UPDATE ON assistant_mcps 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();