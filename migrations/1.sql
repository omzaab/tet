
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mocha_user_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('landlord', 'tenant', 'both')),
  trust_score INTEGER DEFAULT 100,
  total_reviews INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  property_type TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reviewer_id INTEGER NOT NULL,
  reviewee_id INTEGER NOT NULL,
  property_id INTEGER,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  issue_types TEXT,
  evidence_image_url TEXT,
  is_valid BOOLEAN DEFAULT 1,
  ai_validation_reason TEXT,
  trust_score_impact INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_id) REFERENCES users (id),
  FOREIGN KEY (reviewee_id) REFERENCES users (id),
  FOREIGN KEY (property_id) REFERENCES properties (id)
);
