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

INSERT INTO users (username, password, display_name, role) VALUES
('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', '系统管理员', 'admin'),
('proofreader1', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', '校对员甲', 'proofreader'),
('proofreader2', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', '校对员乙', 'proofreader'),
('proofreader3', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', '校对员丙', 'proofreader'),
('reviewer1', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', '审稿人甲', 'reviewer');

INSERT INTO dictionaries (name, type, description) VALUES
('异体字字典', 'variant', '收录古籍常见异体字，同一字的不同写法'),
('繁简对照字典', 'simplified_traditional', '繁体字与简体字的对应关系');

INSERT INTO dictionary_entries (dictionary_id, standard_char, variant_char, note) VALUES
(1, '為', '爲', '古文异体'),
(1, '說', '説', '古文异体'),
(1, '眞', '真', '古文异体'),
(1, '德', '悳', '古文异体'),
(1, '學', '斈', '古文异体'),
(1, '國', '囯', '古文异体'),
(1, '國', '囻', '古文异体'),
(1, '書', '慈', '古文异体'),
(1, '經', '経', '古文异体'),
(1, '禮', '礼', '古文异体'),
(2, '為', '为', '繁简对应'),
(2, '說', '说', '繁简对应'),
(2, '眞', '真', '繁简对应'),
(2, '學', '学', '繁简对应'),
(2, '國', '国', '繁简对应'),
(2, '書', '书', '繁简对应'),
(2, '經', '经', '繁简对应'),
(2, '論', '论', '繁简对应'),
(2, '義', '义', '繁简对应'),
(2, '禮', '礼', '繁简对应');

INSERT INTO books (title, author, dynasty, description, total_pages, status) VALUES
('論語', '孔子', '春秋', '儒家經典，記錄孔子及其弟子言行', 5, 'proofreading'),
('道德經', '老子', '春秋', '道家哲學經典，老子所著', 3, 'proofreading');

INSERT INTO pages (book_id, page_number, image_path, ocr_text, status) VALUES
(1, 1, '/uploads/books/1/pages/1.jpg', NULL, '學而第一\n子曰學而時習之不亦說乎有朋自遠方來不亦樂乎人不知而不慍不亦君子乎\n有子曰其為人也孝弟而好犯上者鮮矣不好犯上而好作亂者未之有也\n君子務本本立而道生孝弟也者其為仁之本與', 'unclaimed'),
(1, 2, '/uploads/books/1/pages/2.jpg', NULL, '子曰巧言令色鮮矣仁\n曾子曰吾日三省吾身為人謀而不忠乎與朋友交而不信乎傳不習乎\n子曰道千乘之國敬事而信節用而愛人使民以時\n子曰弟子入則孝出則弟謹而信汎愛眾而親仁行有餘力則以學文', 'unclaimed'),
(1, 3, '/uploads/books/1/pages/3.jpg', NULL, '子夏曰賢賢易色事父母能竭其力事君能致其身與朋友言而有信\n雖曰未學吾必謂之學矣\n子曰君子不重則不威學則不固主忠信無友不如己者過則勿憚改', 'unclaimed'),
(1, 4, '/uploads/books/1/pages/4.jpg', NULL, '曾子曰慎終追遠民德歸厚矣\n子禽問於子貢曰夫子至於是邦也必聞其政求之與抑與之與\n子貢曰夫子溫良恭儉讓以得之夫子之求之也其諸異乎人之求之與', 'unclaimed'),
(1, 5, '/uploads/books/1/pages/5.jpg', NULL, '子曰父在觀其志父沒觀其行三年無改於父之道可謂孝矣\n有子曰禮之用和為貴先王之道斯為美小大由之\n有所不行知和而和不以禮節之亦不可行也', 'unclaimed'),
(2, 1, '/uploads/books/2/pages/1.jpg', NULL, '道可道非常道名可名非常名\n無名天地之始有名萬物之母\n故常無欲以觀其妙常有欲以觀其徼\n此兩者同出而異名同謂之玄玄之又玄眾妙之門', 'unclaimed'),
(2, 2, '/uploads/books/2/pages/2.jpg', NULL, '天下皆知美之為美斯惡已皆知善之為善斯不善已\n故有無相生難易相成長短相較高下相傾音聲相和前後相隨\n是以聖人處無為之事行不言之教', 'unclaimed'),
(2, 3, '/uploads/books/2/pages/3.jpg', NULL, '不尚賢使民不爭不貴難得之貨使民不為盜\n不見可欲使民心不亂\n是以聖人之治虛其心實其腹弱其志強其骨\n常使民無知無欲使夫智者不敢為也\n為無為則無不治', 'unclaimed');
