/*form the db*/
CREATE DATABASE IF NOT EXISTS cema;
USE cema;

/*table for medics*/
CREATE TABLE IF NOT EXISTS medics(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

/*table for health programs*/
CREATE TABLE IF NOT EXISTS programs(
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    treatments TEXT,
    follow_up_notes TEXT
);

/*client table*/
CREATE TABLE IF NOT EXISTS clients(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT,
    gender VARCHAR(10),
    contact VARCHAR(50)
);

/*table for enrollments*/
CREATE TABLE IF NOT EXISTS enrollment(
    id int AUTO_INCREMENT PRIMARY KEY,
    client_id  INT,
    program_id INT,
    enrollment_date DATETIME NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/*this will act as password before i set the admin page*/
INSERT INTO medics(username, password) VALUES('admin', 'admin');