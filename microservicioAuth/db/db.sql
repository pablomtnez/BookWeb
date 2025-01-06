
-- Comprobar si existe la base de datos y eliminarla si es necesario
DROP DATABASE IF EXISTS bookweb;

-- Crear la base de datos bookweb
CREATE DATABASE bookweb;

-- Usar la base de datos bookweb
USE bookweb;

-- Comprobar si existe la tabla user y eliminarla si es necesario
DROP TABLE IF EXISTS user;

-- Crear la tabla user
CREATE TABLE user (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(45) NOT NULL,
    username VARCHAR(45) NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Comprobar si existe la tabla favoriteBooks y eliminarla si es necesario
DROP TABLE IF EXISTS favoriteBooks;

-- Crear la tabla favoriteBooks
CREATE TABLE favoriteBooks (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    username VARCHAR(45) NOT NULL,
    bookID VARCHAR(45) NOT NULL
);