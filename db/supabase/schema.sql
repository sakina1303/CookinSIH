-- =============================
-- SUPABASE MASTER DATABASE
-- =============================

-- Students
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY,
    name text,
    grade int,
    created_at timestamptz DEFAULT now()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    id uuid PRIMARY KEY,
    name text,
    school text
);

-- Class mapping (Teacher -> Classes)
CREATE TABLE IF NOT EXISTS classes (
    id uuid PRIMARY KEY,
    teacher_id uuid REFERENCES teachers(id),
    class_name text,
    grade int,
    section text
);

-- Which student belongs to which class
CREATE TABLE IF NOT EXISTS student_class_map (
    id uuid PRIMARY KEY,
    class_id uuid REFERENCES classes(id),
    student_id uuid REFERENCES students(id)
);

-- Questions asked by student
CREATE TABLE IF NOT EXISTS question_events (
    id uuid PRIMARY KEY,
    student_id uuid REFERENCES students(id),
    raw_question text,
    asked_at timestamptz,
    lang text
);

-- Model answers
CREATE TABLE IF NOT EXISTS answer_events (
    id uuid PRIMARY KEY,
    question_id uuid REFERENCES question_events(id),
    answer_text text,
    was_helpful boolean,
    time_taken_ms int
);

-- Mastery snapshots
CREATE TABLE IF NOT EXISTS mastery_snapshots (
    id uuid PRIMARY KEY,
    student_id uuid REFERENCES students(id),
    chapter_id int,
    score numeric,
    last_updated timestamptz
);

-- Quiz metadata
CREATE TABLE IF NOT EXISTS quiz_events (
    id uuid PRIMARY KEY,
    student_id uuid REFERENCES students(id),
    chapter_id int,
    score int,
    taken_at timestamptz
);

-- Teacher feedback
CREATE TABLE IF NOT EXISTS teacher_feedback (
    id uuid PRIMARY KEY,
    teacher_id uuid REFERENCES teachers(id),
    student_id uuid REFERENCES students(id),
    chapter_id int,
    feedback text,
    given_at timestamptz DEFAULT now()
);
