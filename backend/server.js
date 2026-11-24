const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Garante que a pasta uploads exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (fotos enviadas e frontend integrado)
app.use('/uploads', express.static(uploadsDir));
app.use('/', express.static(path.join(__dirname, '../frontend')));

// Configuração do Multer para upload de evidências fotográficas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagem inválido. Envie apenas JPEG ou PNG.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Máximo 5 MB
});

// =================================================================
// ROTAS DA API REST (CIDADÃO CONECTA - PoC)
// =================================================================

// 1. GET /api/categorias -> Lista categorias de zeladoria urbana
app.get('/api/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_categoria, nome_categoria, orgao_responsavel FROM Categoria ORDER BY id_categoria ASC'
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ erro: 'Erro interno ao listar categorias.' });
  }
});

// 2. POST /api/chamados -> Cria novo chamado, salva foto e gera protocolo
app.post('/api/chamados', upload.single('foto'), async (req, res) => {
  const { latitude, longitude, ponto_referencia, id_categoria, descricao } = req.body;

  // Validação de campos obrigatórios
  if (!latitude || !longitude || !id_categoria || !descricao || !descricao.trim()) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(400).json({
      erro: 'Campos obrigatórios ausentes. Informe localização (latitude/longitude), categoria e descrição.'
    });
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(400).json({ erro: 'Coordenadas geográficas inválidas.' });
  }

  const caminhoFoto = req.file ? `uploads/${req.file.filename}` : null;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insere com protocolo temporário para obter o ID auto-incremental
    const tempProtocolo = `TEMP-${crypto.randomBytes(6).toString('hex')}`;
    const [result] = await connection.query(
      `INSERT INTO Chamado 
        (protocolo, id_categoria, descricao, latitude, longitude, ponto_referencia, caminho_foto) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tempProtocolo,
        Number(id_categoria),
        descricao.trim(),
        latNum,
        lngNum,
        ponto_referencia ? ponto_referencia.trim() : null,
        caminhoFoto
      ]
    );

    const idChamado = result.insertId;
    const anoAtual = new Date().getFullYear();
    const sequencial = String(idChamado).padStart(4, '0');
    const protocoloFinal = `#CC-${anoAtual}-${sequencial}`;

    await connection.query(
      'UPDATE Chamado SET protocolo = ? WHERE id_chamado = ?',
      [protocoloFinal, idChamado]
    );

    await connection.commit();

    const [chamadoCriado] = await pool.query(
      `SELECT c.id_chamado, c.protocolo, c.descricao, c.latitude, c.longitude, 
              c.ponto_referencia, c.caminho_foto, c.status_chamado, c.data_abertura,
              cat.nome_categoria, cat.orgao_responsavel
         FROM Chamado c
         JOIN Categoria cat ON c.id_categoria = cat.id_categoria
        WHERE c.id_chamado = ?`,
      [idChamado]
    );

    return res.status(201).json({
      mensagem: 'Chamado registrado com sucesso!',
      protocolo: protocoloFinal,
      chamado: chamadoCriado[0]
    });
  } catch (error) {
    await connection.rollback();
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Erro ao registrar chamado:', error);
    return res.status(500).json({ erro: 'Erro interno ao registrar o chamado no banco de dados.' });
  } finally {
    connection.release();
  }
});

// 3. GET /api/chamados/:protocolo -> Consulta status pelo código do protocolo
app.get('/api/chamados/:protocolo', async (req, res) => {
  try {
    let { protocolo } = req.params;
    protocolo = decodeURIComponent(protocolo).trim().toUpperCase();
    if (!protocolo.startsWith('#')) {
      protocolo = `#${protocolo}`;
    }

    const [rows] = await pool.query(
      `SELECT c.id_chamado, c.protocolo, c.descricao, c.latitude, c.longitude, 
              c.ponto_referencia, c.caminho_foto, c.status_chamado, c.data_abertura,
              cat.nome_categoria, cat.orgao_responsavel
         FROM Chamado c
         JOIN Categoria cat ON c.id_categoria = cat.id_categoria
        WHERE c.protocolo = ?`,
      [protocolo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: `Nenhum chamado encontrado para o protocolo ${protocolo}.` });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao consultar protocolo:', error);
    return res.status(500).json({ erro: 'Erro interno ao consultar o protocolo.' });
  }
});

// Tratamento de erros do Multer (upload)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ erro: `Erro no upload da imagem: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ erro: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(` Servidor Cidadão Conecta (PoC) rodando em:`);
  console.log(` http://localhost:${PORT}`);
  console.log(`=========================================================`);
});
