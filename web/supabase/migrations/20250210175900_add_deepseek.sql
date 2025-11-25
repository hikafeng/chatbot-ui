ALTER TABLE profiles
ADD COLUMN deepseek_api_key TEXT CHECK (char_length(deepseek_api_key) <= 1000);
