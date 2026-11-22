-- =================================================================
-- SCRIPT DML: CARGA INICIAL DE CATEGORIAS E TESTE DE CHAMADO
-- =================================================================
USE cidadao_conecta_db;

-- 1. População das categorias de zeladoria urbana (Fortaleza)
INSERT INTO Categoria (nome_categoria, orgao_responsavel) VALUES
('Via Pública / Buraco na Pista', 'Secretaria Municipal de Infraestrutura (SEINF)'),
('Coleta de Lixo / Entulho', 'Autarquia de Regulação e Fiscalização (ACFOR)'),
('Iluminação Pública / Falta de Energia', 'ENEL Ceará / Iluminação Pública'),
('Vazamento / Falta de Água', 'Companhia de Água e Esgoto do Ceará (CAGECE)');

-- 2. Simulação de registro da Persona 1 (José Eduardo Freitas)
INSERT INTO Chamado (
    protocolo, id_categoria, descricao, latitude, longitude, ponto_referencia, caminho_foto
) VALUES (
    '#CC-2026-0001',
    1,
    'Buraco profundo na faixa da direita causando risco aos motoristas.',
    -3.73186200,
    -38.52666900,
    'Av. Bezerra de Menezes, próximo ao nº 1200',
    'uploads/2026_buraco_via_001.jpg'
);
