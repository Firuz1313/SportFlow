-- Seed roles
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('coach') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('athlete') ON CONFLICT (name) DO NOTHING;

-- Seed users
INSERT INTO users (id, email, full_name)
VALUES
  ('11111111-1111-1111-1111-111111111111','admin@sportflow.app','Администратор Системы')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, full_name)
VALUES
  ('22222222-2222-2222-2222-222222222222','coach@sportflow.app','Тренер Петров')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, full_name)
VALUES
  ('33333333-3333-3333-3333-333333333333','athlete@sportflow.app','Спортсмен Иванов')
ON CONFLICT (id) DO NOTHING;

-- Map roles
INSERT INTO user_roles (user_id, role_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM roles WHERE name='admin'
ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM roles WHERE name='coach'
ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id)
SELECT '33333333-3333-3333-3333-333333333333', id FROM roles WHERE name='athlete'
ON CONFLICT DO NOTHING;

-- Sample athletes (owner is coach by default)
INSERT INTO athletes (id, first_name, last_name, sport, age, avatar_url, video_url, team, metrics, created_at, updated_at, owner_id)
VALUES
  ('a1','Иван','Иванов','Лёгкая атлетика',24,'https://images.unsplash.com/photo-1521417531039-6949f3f9f2b5',NULL,'Спарта','{"speed": 9.4, "endurance": 85, "strength": 72}', NOW(), NOW(),'22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

INSERT INTO athletes (id, first_name, last_name, sport, age, avatar_url, video_url, team, metrics, created_at, updated_at, owner_id)
VALUES
  ('a2','Пётр','Смирнов','Плавание',21,'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',NULL,'Дельфин','{"speed": 8.1, "endurance": 92, "strength": 69}', NOW(), NOW(),'22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

INSERT INTO athletes (id, first_name, last_name, sport, age, avatar_url, video_url, team, metrics, created_at, updated_at, owner_id)
VALUES
  ('a3','Мария','Соколова','Теннис',19,'https://images.unsplash.com/photo-1502904550040-7534597429ae',NULL,'Айс','{"speed": 7.6, "endurance": 78, "strength": 65}', NOW(), NOW(),'22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

INSERT INTO athletes (id, first_name, last_name, sport, age, avatar_url, video_url, team, metrics, created_at, updated_at, owner_id)
VALUES
  ('a4','Екатерина','Новикова','Футбол',26,'https://images.unsplash.com/photo-1517649763962-0c623066013b',NULL,'Олимп','{"speed": 8.8, "endurance": 82, "strength": 80}', NOW(), NOW(),'22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;
