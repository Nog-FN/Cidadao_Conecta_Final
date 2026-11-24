# Cidadao_Conecta_Final
Trabalho a ser entregue para a disciplina Projeto Integrador.
# Cidadão Conecta — Prova de Conceito (2ª entrega)

**Projeto Integrador · Senac EAD · Análise e Desenvolvimento de Sistemas · 2026**

## Integrantes

* Andressa do Socorro de Lima Moura

* Flávio da Silva Nogueira

* Michael Oliveira da Silva

* Michelli Costa Canals

* Sergio Luis Neves Filho

---

## 1. Revisita do Projeto e Definição da PoC
* **Projeto:** Plataforma digital (Mobile/Web responsivo) voltada a centralizar o registro, acompanhamento e gestão de chamados de zeladoria urbana na cidade de Fortaleza (buracos em vias, falta de energia, vazamentos e coleta de lixo).
* **Jornada escolhida (Persona 1 – José Eduardo Freitas, etapas 1 a 5):** Identificação do problema → Acesso ao sistema → Captura de localização GPS → Registro com foto e categoria → Confirmação com número de protocolo.
* **Hipótese da PoC:** O cidadão consegue ir de *"encontrei um problema urbano"* até *"recebi meu protocolo de atendimento"* em uma única tela objetiva e em poucos segundos, com geolocalização automática e persistência real em banco de dados relacional.
* **Delimitação de escopo (Fora da PoC):** Painel gerencial com gráficos para gestores públicos (Persona 2), triagem automática por Inteligência Artificial e notificações push em tempo real ficam reservados para etapas futuras.

---

## 2. Arquitetura e Stack Tecnológica

```
Frontend (HTML5 / Bootstrap 5 / JS ES6+)
   │  Geolocation API + FileReader API + Fetch API
   ▼
Backend (Node.js + Express + Multer) ──► /uploads (Evidências Fotográficas)
   │  API RESTful (JSON / multipart-form-data)
   ▼
Repositório de Dados (MySQL / MariaDB) ──► cidadao_conecta_db
```

### Endpoints da API REST
| Método / Rota | Descrição | Retorno |
| :--- | :--- | :--- |
| `GET /api/categorias` | Lista as categorias de zeladoria urbana disponíveis | `200 OK` (JSON) |
| `POST /api/chamados` | Registra ocorrência, salva foto em `/uploads` e gera protocolo `#CC-ANO-SEQ` | `201 Created` (JSON) |
| `GET /api/chamados/:protocolo` | Consulta detalhes e status de um chamado pelo protocolo | `200 OK` / `404` |

---

## 3. Como Executar Localmente

### Pré-requisitos
* **Node.js** (v18 ou superior)
* **MySQL** ou **MariaDB** (via XAMPP, Docker ou instalação local)

### Passo 1: Configurar o Banco de Dados
Execute os scripts localizados na pasta `database/` no seu servidor MySQL:
1. `database/DDL_Criacao_Tabelas.sql` (cria o banco `cidadao_conecta_db` e as tabelas `Categoria` e `Chamado`).
2. `database/DML_Insercao_Dados.sql` (popula as categorias de Fortaleza e insere um chamado de teste `#CC-2026-0001`).

### Passo 2: Configurar e Iniciar o Backend
```bash
cd backend
cp .env.example .env   # Ajuste DB_USER e DB_PASSWORD conforme seu ambiente
npm install
npm start
```

### Passo 3: Acessar a Aplicação
Abra o navegador e acesse:
```
http://localhost:3000
```
*(O servidor Express serve tanto a API REST quanto os arquivos estáticos do Frontend).*

---

## 4. Estrutura de Pastas do Repositório

```
cidadao-conecta-poc/
├── frontend/
│   ├── index.html                   # Telas: Home, Formulário de Chamado e Confirmação
│   ├── css/
│   │   └── style.css                # Estilos customizados Mobile-First
│   └── js/
│       └── app.js                   # Geolocation API, FileReader e chamadas Fetch API
├── backend/
│   ├── server.js                    # Servidor Express, rotas REST e geração de protocolo
│   ├── db.js                        # Pool de conexão com MySQL (mysql2)
│   ├── package.json                 # Dependências do projeto Node.js
│   ├── .env.example                 # Modelo de variáveis de ambiente
│   └── uploads/                     # Diretório de armazenamento das fotos enviadas
├── database/
│   ├── DDL_Criacao_Tabelas.sql      # Criação do esquema e tabelas relacionais
│   └── DML_Insercao_Dados.sql       # Carga inicial de categorias e registro de teste
├── .gitignore
└── README.md
```
