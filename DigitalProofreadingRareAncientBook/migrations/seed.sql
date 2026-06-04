USE ancient_book_proofread;

INSERT INTO users (username, password, display_name, role) VALUES
('admin', 'admin123', '系统管理员', 'admin'),
('proofreader1', 'proof123', '校对员甲', 'proofreader'),
('proofreader2', 'proof123', '校对员乙', 'proofreader'),
('proofreader3', 'proof123', '校对员丙', 'proofreader'),
('reviewer1', 'review123', '审稿人甲', 'reviewer');

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
(1, 1, '/uploads/books/1/pages/1.jpg', NULL, 'unclaimed'),
(1, 2, '/uploads/books/1/pages/2.jpg', NULL, 'unclaimed'),
(1, 3, '/uploads/books/1/pages/3.jpg', NULL, 'unclaimed'),
(1, 4, '/uploads/books/1/pages/4.jpg', NULL, 'unclaimed'),
(1, 5, '/uploads/books/1/pages/5.jpg', NULL, 'unclaimed'),
(2, 1, '/uploads/books/2/pages/1.jpg', NULL, 'unclaimed'),
(2, 2, '/uploads/books/2/pages/2.jpg', NULL, 'unclaimed'),
(2, 3, '/uploads/books/2/pages/3.jpg', NULL, 'unclaimed');
