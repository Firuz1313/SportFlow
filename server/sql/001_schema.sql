-- Users and roles
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id text PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id text NOT NULL,
  role_id text NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Athletes
CREATE TABLE IF NOT EXISTS athletes (
  id text PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  sport text NOT NULL,
  age int NOT NULL,
  avatar_url text,
  video_url text,
  team text,
  metrics jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure defaults exist even if table was created earlier without them
ALTER TABLE IF EXISTS athletes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE IF EXISTS athletes ALTER COLUMN updated_at SET DEFAULT now();
