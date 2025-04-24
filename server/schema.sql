/*form the db*/
CREATE DATABASE IF NOT EXISTS cema;
USE cema;

/*table for medics*/
CREATE TABLE IF NOT EXISTS medic(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

/*table for health programs*/
CREATE TABLE IF NOT EXISTS program(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    treatments TEXT,
    follow_up_notes TEXT
);

/*client table*/
CREATE TABLE IF NOT EXISTS client(
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
    FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (program_id) REFERENCES program(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);