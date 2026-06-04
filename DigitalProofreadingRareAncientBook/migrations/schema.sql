CREATE DATABASE IF NOT EXISTS ancient_book_proofread DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ancient_book_proofread;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role ENUM('admin', 'proofreader', 'reviewer') NOT NULL DEFAULT 'proofreader',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    dynasty VARCHAR(50),
    description TEXT,
    total_pages INT DEFAULT 0,
    status ENUM('processing', 'proofreading', 'completed') DEFAULT 'proofreading',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    page_number INT NOT NULL,
    image_path VARCHAR(500),
    dzi_path VARCHAR(500),
    ocr_text LONGTEXT,
    status ENUM('unclaimed', 'proofreading', 'first_done', 'pending_review', 'finalized') DEFAULT 'unclaimed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY uk_book_page (book_id, page_number)
) ENGINE=InnoDB;

CREATE TABLE page_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    user_id INT NOT NULL,
    round TINYINT NOT NULL DEFAULT 1,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    released_at DATETIME NULL,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE proofreadings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    user_id INT NOT NULL,
    text_content LONGTEXT NOT NULL,
    status ENUM('draft', 'submitted') DEFAULT 'draft',
    submitted_at DATETIME NULL,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    proofreading_1_id INT NOT NULL,
    proofreading_2_id INT NOT NULL,
    final_text LONGTEXT NOT NULL,
    finalized_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (proofreading_1_id) REFERENCES proofreadings(id),
    FOREIGN KEY (proofreading_2_id) REFERENCES proofreadings(id)
) ENGINE=InnoDB;

CREATE TABLE dictionaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('variant', 'simplified_traditional') NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE dictionary_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dictionary_id INT NOT NULL,
    standard_char VARCHAR(10) NOT NULL,
    variant_char VARCHAR(10) NOT NULL,
    note TEXT,
    FOREIGN KEY (dictionary_id) REFERENCES dictionaries(id) ON DELETE CASCADE,
    INDEX idx_standard_char (standard_char),
    INDEX idx_variant_char (variant_char)
) ENGINE=InnoDB;
