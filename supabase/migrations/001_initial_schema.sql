-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Todos table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' 
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    tags TEXT[],
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_assignee_id ON todos(assignee_id);
CREATE INDEX idx_todos_created_by ON todos(created_by);
CREATE INDEX idx_todos_team_id ON todos(team_id);
CREATE INDEX idx_todos_tags ON todos USING GIN(tags);
CREATE INDEX idx_todos_created_at ON todos(created_at);

-- Full-text search index
CREATE INDEX idx_todos_search ON todos USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL Security;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Team members can view team" ON teams FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid()
    ));

CREATE POLICY "Team admins can update team" ON teams FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = teams.id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    ));

-- Team members policies
CREATE POLICY "Team members can view team members" ON team_members FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
    ));

-- Media attachments table
CREATE TABLE media_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for media attachments
CREATE INDEX idx_media_todo_id ON media_attachments(todo_id);
CREATE INDEX idx_media_created_by ON media_attachments(created_by);

-- Todos policies
CREATE POLICY "Users can view own todos" ON todos FOR SELECT 
    USING (created_by = auth.uid() OR team_id IS NULL OR EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = todos.team_id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can create todos" ON todos FOR INSERT 
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own todos" ON todos FOR UPDATE 
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = todos.team_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    ));

CREATE POLICY "Users can delete own todos" ON todos FOR DELETE 
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = todos.team_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    ));

-- Media attachments policies
CREATE POLICY "Users can view media for accessible todos" ON media_attachments FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM todos 
        WHERE todos.id = media_attachments.todo_id AND (
            todos.created_by = auth.uid() OR 
            todos.team_id IS NULL OR 
            EXISTS (
                SELECT 1 FROM team_members 
                WHERE team_id = todos.team_id AND user_id = auth.uid()
            )
        )
    ));

CREATE POLICY "Users can create media for own todos" ON media_attachments FOR INSERT 
    WITH CHECK (created_by = auth.uid() AND EXISTS (
        SELECT 1 FROM todos 
        WHERE todos.id = todo_id AND todos.created_by = auth.uid()
    ));

CREATE POLICY "Users can delete own media" ON media_attachments FOR DELETE 
    USING (created_by = auth.uid());