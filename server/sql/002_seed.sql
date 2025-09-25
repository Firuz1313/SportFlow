-- Roles
INSERT INTO roles (id, name) VALUES
  ('role-admin', 'admin'),
  ('role-coach', 'coach'),
  ('role-athlete', 'athlete')
ON CONFLICT (id) DO NOTHING;

-- Users (passwords will be set by server after seeding)
INSERT INTO users (id, email, full_name, password_hash)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Администратор', NULL),
  ('22222222-2222-2222-2222-222222222222', 'coach@example.com', 'Тренер', NULL),
  ('33333333-3333-3333-3333-333333333333', 'athlete@example.com', 'Спортсмен', NULL)
ON CONFLICT (id) DO NOTHING;

-- User roles
INSERT INTO user_roles (user_id, role_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'role-admin'),
  ('22222222-2222-2222-2222-222222222222', 'role-coach'),
  ('33333333-3333-3333-3333-333333333333', 'role-athlete')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Athletes sample data
INSERT INTO athletes (id, first_name, last_name, sport, age, avatar_url, video_url, team, metrics)
VALUES
  ('a1', 'Иван', 'Петров', 'Футбол', 24, NULL, NULL, 'Спартак', '{"speed": 85, "endurance": 78, "strength": 70}'::jsonb),
  ('a2', 'Анна', 'Сидорова', 'Лёгкая атлетика', 22, NULL, NULL, NULL, '{"speed": 92, "endurance": 81, "strength": 60}'::jsonb),
  ('a3', 'Павел', 'Ильин', 'Баскетбол', 27, NULL, NULL, 'Зенит', '{"speed": 76, "endurance": 74, "strength": 82}'::jsonb),
  ('a4', 'Мария', 'Кузнецова', 'Плавание', 20, NULL, NULL, NULL, '{"speed": 88, "endurance": 86, "strength": 65}'::jsonb),
  ('a5', 'Дмитрий', 'Смирнов', 'Хоккей', 26, NULL, NULL, 'Авангард', '{"speed": 80, "endurance": 72, "strength": 90}'::jsonb),
  ('a6', 'Елена', 'Орлова', 'Теннис', 23, NULL, NULL, NULL, '{"speed": 84, "endurance": 77, "strength": 68}'::jsonb)
ON CONFLICT (id) DO NOTHING;
