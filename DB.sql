-- Create the database
CREATE DATABASE IF NOT EXISTS sport_partner_finder;
USE sport_partner_finder;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    primary_district VARCHAR(50) NOT NULL,
    commitment_score INT DEFAULT 100, -- Starts at 100, decreases for no-shows
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues Table (Green Suggestions)
CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    is_free BOOLEAN DEFAULT TRUE,
    venue_type VARCHAR(50) -- e.g., Park, Public Court, Paid Gym
);

-- Sessions Table (The Matchings)
CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    sport_type VARCHAR(50) NOT NULL, -- Running, Badminton, Football, Gym, Pickleball
    skill_level VARCHAR(20) NOT NULL, -- Beginner, Intermediate, Advanced
    venue_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    max_participants INT DEFAULT 2,
    status VARCHAR(20) DEFAULT 'Open', -- Open, Full, Completed, Cancelled
    FOREIGN KEY (creator_id) REFERENCES users(user_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

-- Session Participants (Tracking and Ratings)
CREATE TABLE session_participants (
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Joined', -- Joined, Checked-in, No-show
    partner_rating INT DEFAULT NULL, -- 1 to 5 stars
    PRIMARY KEY (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert Sample Data for Demonstration
INSERT INTO venues (name, district, address, is_free, venue_type) VALUES
('Thong Nhat Park', 'Hai Ba Trung', 'Tran Nhan Tong Street', TRUE, 'Park'),
('Cau Giay Park', 'Cau Giay', 'Thanh Thai Street', TRUE, 'Park'),
('Bach Khoa Stadium', 'Hai Ba Trung', 'Ta Quang Buu', FALSE, 'Public Court');

INSERT INTO users (full_name, email, primary_district, commitment_score) VALUES
('Nguyen Van A', 'a.nguyen@email.com', 'Hai Ba Trung', 95),
('Tran Thi B', 'b.tran@email.com', 'Cau Giay', 100);