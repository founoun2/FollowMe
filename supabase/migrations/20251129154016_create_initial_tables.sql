CREATE TABLE notifications (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid REFERENCES users(id) ON DELETE CASCADE,
	message text NOT NULL,
	type text NOT NULL, -- 'success', 'error', 'info'
	created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE transactions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid REFERENCES users(id) ON DELETE CASCADE,
	type text NOT NULL, -- 'earn', 'spend', 'purchase', 'bonus'
	amount integer NOT NULL,
	date timestamp with time zone DEFAULT now(),
	description text,
	created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE tasks (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
	platform text NOT NULL,
	type text NOT NULL,
	reward integer NOT NULL,
	description text,
	target_url text NOT NULL,
	thumbnail_url text,
	completed boolean DEFAULT false,
	country text,
	created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE campaigns (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid REFERENCES users(id) ON DELETE CASCADE,
	platform text NOT NULL,
	type text NOT NULL,
	target_url text NOT NULL,
	description text,
	total_requested integer NOT NULL,
	completed_count integer DEFAULT 0,
	cost_per_action integer NOT NULL,
	status text NOT NULL,
	tags text[],
	country text,
	thumbnail_url text,
	created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE users (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	username text NOT NULL,
	email text NOT NULL UNIQUE,
	credits integer DEFAULT 0,
	reputation integer DEFAULT 0,
	avatar_url text,
	streak integer DEFAULT 0,
	last_login_date timestamp,
	ad_watches_today integer DEFAULT 0,
	last_ad_date timestamp,
	country text,
	language text,
	currency_code text,
	currency_symbol text,
	created_at timestamp with time zone DEFAULT now()
);
