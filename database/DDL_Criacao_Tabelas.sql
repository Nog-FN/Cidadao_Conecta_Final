-- =================================================================
-- SCRIPT DDL: CRIAÇÃO DO BANCO E TABELAS (CIDADÃO CONECTA - PoC)
-- =================================================================
CREATE DATABASE IF NOT EXISTS cidadao_conecta_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cidadao_conecta_db;

CREATE TABLE IF NOT EXISTS Categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(80) NOT NULL,
    orgao_responsavel VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Chamado (
    id_chamado INT AUTO_INCREMENT PRIMARY KEY,
    protocolo VARCHAR(20) UNIQUE NOT NULL,
    id_categoria INT NOT NULL,
    descricao TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    ponto_referencia VARCHAR(150),
    caminho_foto VARCHAR(255),
    status_chamado VARCHAR(30) DEFAULT 'Aberto',
    data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);
