/*
  # Pathshala Portal - Core Database Tables

  ## Summary
  Creates the core tables for the Pathshala coaching portal with cross-device sync.

  ## New Tables

  ### 1. `approved_students`
  Stores students approved by teachers. Visible across all devices.
  - `id` (uuid, primary key)
  - `student_name` (text)
  - `guardian_name` (text)
  - `phone` (text, unique) - used as login identifier
  - `email` (text)
  - `class` (text) - e.g. "Class 9"
  - `subjects` (text)
  - `address` (text)
  - `submitted_at` (timestamptz)
  - `approved_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 2. `tests`
  Tests created by teachers. Has a lifecycle: active -> completed -> graded.
  - `id` (uuid, primary key)
  - `class` (text)
  - `subject` (text)
  - `type` (text) - MCQ, SAQ, etc.
  - `title` (text) - test title shown in grades
  - `start_at` (timestamptz)
  - `duration` (integer) - minutes
  - `total_marks` (integer)
  - `pdf_url` (text) - URL or name of PDF
  - `status` (text) - 'active', 'completed', 'graded'
  - `created_at` (timestamptz)
  - `graded_at` (timestamptz)

  ### 3. `test_attempts`
  Student attempts at tests.
  - `id` (uuid, primary key)
  - `test_id` (uuid, FK -> tests)
  - `student_phone` (text)
  - `student_name` (text)
  - `class` (text)
  - `attempted_at` (timestamptz)
  - `note` (text)
  - `marks` (integer)
  - `graded_at` (timestamptz)
  - `graded_by` (text)

  ## Security
  - RLS enabled on all tables
  - Public read/write allowed (no auth required - teacher uses phone-based auth)
*/

-- Approved Students table
CREATE TABLE IF NOT EXISTS approved_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL DEFAULT '',
  guardian_name text NOT NULL DEFAULT '',
  phone text UNIQUE NOT NULL,
  email text NOT NULL DEFAULT '',
  class text NOT NULL DEFAULT '',
  subjects text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  approved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE approved_students ENABLE ROW LEVEL SECURITY;

-- Allow public read (teachers and students both need to read)
CREATE POLICY "Public can read approved students"
  ON approved_students FOR SELECT
  TO anon
  USING (true);

-- Allow public insert (teachers add students)
CREATE POLICY "Public can insert approved students"
  ON approved_students FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public update (teachers can update)
CREATE POLICY "Public can update approved students"
  ON approved_students FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow public delete (teachers can remove students)
CREATE POLICY "Public can delete approved students"
  ON approved_students FOR DELETE
  TO anon
  USING (true);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'MCQ',
  title text NOT NULL DEFAULT '',
  start_at timestamptz,
  duration integer NOT NULL DEFAULT 60,
  total_marks integer NOT NULL DEFAULT 50,
  pdf_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  graded_at timestamptz
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tests"
  ON tests FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert tests"
  ON tests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update tests"
  ON tests FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete tests"
  ON tests FOR DELETE
  TO anon
  USING (true);

-- Test Attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_phone text NOT NULL,
  student_name text NOT NULL DEFAULT '',
  class text NOT NULL DEFAULT '',
  attempted_at timestamptz DEFAULT now(),
  note text NOT NULL DEFAULT '',
  marks integer,
  graded_at timestamptz,
  graded_by text
);

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read test attempts"
  ON test_attempts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert test attempts"
  ON test_attempts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update test attempts"
  ON test_attempts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete test attempts"
  ON test_attempts FOR DELETE
  TO anon
  USING (true);

-- Index for fast phone lookup
CREATE INDEX IF NOT EXISTS idx_approved_students_phone ON approved_students(phone);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_student_phone ON test_attempts(student_phone);
CREATE INDEX IF NOT EXISTS idx_tests_class ON tests(class);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
