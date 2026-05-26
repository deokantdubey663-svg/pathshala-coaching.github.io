/*
  # Add Doubts, Announcements, and Notifications Tables

  ## Summary
  Adds three new tables for the Pathshala coaching portal:
  1. Student doubts with one-on-one encryption between student and teacher
  2. Class-specific announcements by teachers
  3. Notification tracking for SMS delivery

  ## New Tables

  ### 1. `doubts`
  One-on-one encrypted doubt conversations between student and teacher.
  - `id` (uuid, primary key)
  - `student_phone` (text) - student who asked the doubt
  - `student_name` (text) - student display name
  - `student_class` (text) - student's class
  - `subject` (text) - subject the doubt is about
  - `question` (text) - encrypted doubt question (AES-256 encrypted)
  - `question_iv` (text) - initialization vector for decryption
  - `answer` (text) - encrypted teacher reply (AES-256 encrypted)
  - `answer_iv` (text) - initialization vector for answer decryption
  - `teacher_phone` (text) - teacher who replied
  - `status` (text) - 'pending', 'answered'
  - `created_at` (timestamptz)
  - `answered_at` (timestamptz)

  ### 2. `announcements`
  Class-specific announcements created by teachers.
  - `id` (uuid, primary key)
  - `teacher_phone` (text) - teacher who created announcement
  - `title` (text) - announcement title
  - `message` (text) - announcement content
  - `target_class` (text) - specific class OR 'all' for all students
  - `priority` (text) - 'normal', 'important', 'urgent'
  - `created_at` (timestamptz)

  ### 3. `notifications`
  Tracks notification delivery to students (for SMS via edge function).
  - `id` (uuid, primary key)
  - `student_phone` (text) - recipient phone
  - `student_name` (text) - recipient name
  - `announcement_id` (uuid, FK -> announcements)
  - `type` (text) - 'announcement', 'test_reminder'
  - `message` (text) - notification content
  - `delivered` (boolean) - whether SMS was sent
  - `delivered_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read/write allowed (phone-based auth as per existing pattern)
*/

-- Doubts table (one-on-one encrypted conversations)
CREATE TABLE IF NOT EXISTS doubts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_phone text NOT NULL,
  student_name text NOT NULL DEFAULT '',
  student_class text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  question text NOT NULL,
  question_iv text NOT NULL DEFAULT '',
  answer text,
  answer_iv text,
  teacher_phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  answered_at timestamptz
);

ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read doubts"
  ON doubts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert doubts"
  ON doubts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update doubts"
  ON doubts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete doubts"
  ON doubts FOR DELETE
  TO anon
  USING (true);

-- Announcements table (class-specific)
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_phone text NOT NULL,
  title text NOT NULL DEFAULT '',
  message text NOT NULL,
  target_class text NOT NULL DEFAULT 'all',
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read announcements"
  ON announcements FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert announcements"
  ON announcements FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update announcements"
  ON announcements FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete announcements"
  ON announcements FOR DELETE
  TO anon
  USING (true);

-- Notifications table (SMS delivery tracking)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_phone text NOT NULL,
  student_name text NOT NULL DEFAULT '',
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'announcement',
  message text NOT NULL DEFAULT '',
  delivered boolean NOT NULL DEFAULT false,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read notifications"
  ON notifications FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert notifications"
  ON notifications FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update notifications"
  ON notifications FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete notifications"
  ON notifications FOR DELETE
  TO anon
  USING (true);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_doubts_student_phone ON doubts(student_phone);
CREATE INDEX IF NOT EXISTS idx_doubts_status ON doubts(status);
CREATE INDEX IF NOT EXISTS idx_announcements_target_class ON announcements(target_class);
CREATE INDEX IF NOT EXISTS idx_notifications_student_phone ON notifications(student_phone);
CREATE INDEX IF NOT EXISTS idx_notifications_announcement_id ON notifications(announcement_id);
