-- CodeForge Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  template_code TEXT,
  test_cases JSONB NOT NULL DEFAULT '[]',
  constraints TEXT,
  examples JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  language VARCHAR(30) NOT NULL,
  code TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error')),
  runtime_ms INTEGER,
  memory_kb INTEGER,
  test_results JSONB DEFAULT '[]',
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed sample challenges
INSERT INTO challenges (title, slug, description, difficulty, category, points, template_code, test_cases, examples) VALUES
(
  'Two Sum',
  'two-sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'easy',
  'Arrays',
  10,
  'function twoSum(nums, target) {\n  // Your code here\n}',
  '[{"input": "[2,7,11,15], 9", "expected": "[0,1]"}, {"input": "[3,2,4], 6", "expected": "[1,2]"}]',
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 9"}]'
),
(
  'Reverse String',
  'reverse-string',
  'Write a function that reverses a string. The input string is given as an array of characters.',
  'easy',
  'Strings',
  10,
  'function reverseString(s) {\n  // Your code here\n}',
  '[{"input": "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "expected": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}]',
  '[{"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}]'
),
(
  'Valid Parentheses',
  'valid-parentheses',
  'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
  'medium',
  'Stacks',
  20,
  'function isValid(s) {\n  // Your code here\n}',
  '[{"input": "()", "expected": "true"}, {"input": "()[]{}", "expected": "true"}, {"input": "(]", "expected": "false"}]',
  '[{"input": "s = \"()\"", "output": "true"}, {"input": "s = \"(]\"", "output": "false"}]'
)
ON CONFLICT (slug) DO NOTHING;
