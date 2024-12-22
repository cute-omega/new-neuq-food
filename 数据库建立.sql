CREATE TABLE announcement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT
);

CREATE TABLE shop (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description TEXT,
    image-url-json TEXT,
    location VARCHAR(255),
    rating DECIMAL(5,2),
    is-wx-app-direct BOOLEAN,
    wx-app VARCHAR(255)
);
