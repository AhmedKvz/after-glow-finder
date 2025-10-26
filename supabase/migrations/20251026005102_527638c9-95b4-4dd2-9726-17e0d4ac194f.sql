
-- Drop foreign key constraint temporarily for demo
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Create past event first
INSERT INTO events (host_id, title, description, location, date, start_time, end_time, capacity, dj_name, music_tags, bring_own_drinks, allow_plus_one, allow_plus_two)
VALUES ('62eed572-fcba-4005-a760-45c2a2d81aa6', 'Belgrade Underground Techno Night', 'Epic techno night!', 'Secret Warehouse', '2025-10-20', '23:00', '06:00', 100, 'DJ Amelie', ARRAY['techno', 'industrial'], true, true, false);

-- Create ticket
WITH ev AS (SELECT id FROM events WHERE title = 'Belgrade Underground Techno Night')
INSERT INTO tickets (event_id, user_id, ticket_code, purchase_date, status, price_paid, qr_code_data)
SELECT id, '62eed572-fcba-4005-a760-45c2a2d81aa6', 'TECH2025', '2025-10-15', 'used', 15, 'TECH2025' FROM ev;

-- Insert 30 profiles manually (simplified)
INSERT INTO profiles (user_id, display_name, city, bio, gender, birthdate, music_tags) VALUES
(gen_random_uuid(), 'Ana M.', 'Belgrade', 'Techno lover 🎶', 'female', '1995-03-15', ARRAY['techno']),
(gen_random_uuid(), 'Marija K.', 'Belgrade', 'Dance till sunrise ✨', 'female', '1997-07-22', ARRAY['techno']),
(gen_random_uuid(), 'Jelena S.', 'Belgrade', 'Music is life 🎧', 'female', '1994-11-08', ARRAY['techno']),
(gen_random_uuid(), 'Teodora P.', 'Belgrade', 'Good vibes', 'female', '1998-05-12', ARRAY['house']),
(gen_random_uuid(), 'Ivana J.', 'Belgrade', 'Techno & coffee ☕', 'female', '1996-09-30', ARRAY['techno']),
(gen_random_uuid(), 'Milica D.', 'Belgrade', 'Underground music', 'female', '1993-12-25', ARRAY['techno']),
(gen_random_uuid(), 'Sara B.', 'Belgrade', 'Rave queen 👑', 'female', '1999-02-14', ARRAY['techno']),
(gen_random_uuid(), 'Nina L.', 'Belgrade', 'Lost in music', 'female', '1995-06-18', ARRAY['techno']),
(gen_random_uuid(), 'Katarina V.', 'Belgrade', 'Party starter 🔥', 'female', '1997-10-03', ARRAY['techno']),
(gen_random_uuid(), 'Aleksandra R.', 'Belgrade', 'Techno addict', 'female', '1994-04-27', ARRAY['techno']),
(gen_random_uuid(), 'Jovana M.', 'Belgrade', 'Dancing through life', 'female', '1998-08-09', ARRAY['house']),
(gen_random_uuid(), 'Tamara G.', 'Belgrade', 'Music & energy', 'female', '1996-01-20', ARRAY['techno']),
(gen_random_uuid(), 'Maja N.', 'Belgrade', 'Night owl 🦉', 'female', '1995-11-11', ARRAY['techno']),
(gen_random_uuid(), 'Dunja K.', 'Belgrade', 'Techno therapy', 'female', '1997-03-05', ARRAY['techno']),
(gen_random_uuid(), 'Sofija T.', 'Belgrade', 'Living for the beat', 'female', '1999-07-19', ARRAY['techno']),
(gen_random_uuid(), 'Lena P.', 'Belgrade', 'Music connects', 'female', '1994-09-22', ARRAY['house']),
(gen_random_uuid(), 'Dragana S.', 'Belgrade', 'Warehouse lover', 'female', '1996-12-08', ARRAY['techno']),
(gen_random_uuid(), 'Emilija C.', 'Belgrade', 'Techno & travel ✈️', 'female', '1998-02-28', ARRAY['techno']),
(gen_random_uuid(), 'Kristina H.', 'Belgrade', 'Bass in heart', 'female', '1995-05-16', ARRAY['drum and bass']),
(gen_random_uuid(), 'Anja F.', 'Belgrade', 'Underground supporter', 'female', '1997-08-31', ARRAY['techno']),
(gen_random_uuid(), 'Nevena Z.', 'Belgrade', 'Dance floor home', 'female', '1994-10-14', ARRAY['techno']),
(gen_random_uuid(), 'Tijana A.', 'Belgrade', 'Electronic soul', 'female', '1999-01-07', ARRAY['techno']),
(gen_random_uuid(), 'Isidora W.', 'Belgrade', 'Always ready', 'female', '1996-04-23', ARRAY['techno']),
(gen_random_uuid(), 'Sanja Q.', 'Belgrade', 'Music lover', 'female', '1998-06-10', ARRAY['techno']),
(gen_random_uuid(), 'Danijela E.', 'Belgrade', 'Techno vibes only', 'female', '1995-09-29', ARRAY['techno']),
(gen_random_uuid(), 'Petra I.', 'Belgrade', 'Living in rhythm', 'female', '1997-12-17', ARRAY['techno']),
(gen_random_uuid(), 'Milena U.', 'Belgrade', 'Rave culture', 'female', '1994-03-26', ARRAY['techno']),
(gen_random_uuid(), 'Zorana Y.', 'Belgrade', 'Electronic beats', 'female', '1999-05-04', ARRAY['house']),
(gen_random_uuid(), 'Bojana O.', 'Belgrade', 'Party animal 🎉', 'female', '1996-07-21', ARRAY['techno']),
(gen_random_uuid(), 'Vesna X.', 'Belgrade', 'Techno warrior', 'female', '1998-11-13', ARRAY['techno']);
