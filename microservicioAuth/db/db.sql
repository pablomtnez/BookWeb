-- Crear la base de datos (si no existe)
DROP DATABASE IF EXISTS bookweb;
CREATE DATABASE bookweb;

-- Usar la base de datos
USE bookweb;

-- Crear la tabla de usuarios
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(45) NOT NULL,
    username VARCHAR(45) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Crear la tabla de favoritos
DROP TABLE IF EXISTS favorites;

CREATE TABLE favorites (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    book VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
