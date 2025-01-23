CREATE TABLE announcement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT
);

CREATE TABLE shop (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description TEXT,
    image_url_json TEXT,
    location VARCHAR(255),
    is_wx_app_url_direct BOOLEAN,
    wx_app_url VARCHAR(255)
);

CREATE TABLE image (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    image_url VARCHAR(255)
)