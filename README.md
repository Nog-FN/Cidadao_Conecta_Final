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

## 1. Revisita do projeto e definição da PoC

* **Projeto:** plataforma digital (Mobile/Web) que centraliza o registro, acompanhamento e gestão de chamados de zeladoria urbana na cidade de Fortaleza, integrando serviços de diferentes órgãos públicos e concessionárias em um único ambiente.

* **Risco principal:** o valor da plataforma depende de o cidadão conseguir relatar uma ocorrência urbana (com localização e evidência visual) de forma rápida e intuitiva, sem precisar descobrir qual órgão é responsável. Funcionalidades complexas como triagem por Inteligência Artificial, painel analítico completo para gestores e integração direta com APIs legadas externas não provam essa hipótese inicial de usabilidade.

* **Jornada escolhida (Persona 1 – José Eduardo Freitas, etapas 1 a 5 da jornada):** identificar problema urbano → acessar plataforma → capturar geolocalização → registrar ocorrência com foto e categoria → receber número de protocolo.

* **Hipótese da PoC:** o cidadão consegue sair da identificação de um problema na via até a obtenção de um protocolo único de atendimento em uma única tela de formulário e em poucos segundos. O resultado esperado é uma aplicação funcional em que o envio, o armazenamento de mídia e a persistência no banco de dados ocorram de ponta a ponta.

* **Mudança em relação à 1ª entrega (justificada):** a 1ª entrega previa autenticação obrigatória de usuários, dashboard para gestores públicos (Persona 2), notificações push em tempo real e categorização automática por IA. Na PoC, optou-se pela abertura direta de chamados sem login e pela seleção manual de categoria em uma lista pré-carregada, focando exclusivamente na validação do fluxo de captura e protocolo. As demais funcionalidades ficam para a versão final.

## 2. Arquitetura

```
Frontend (HTML5 / Bootstrap / JS) ──► API REST (Node.js / Express) ──► MySQL (cidadao_conecta_db)
                                              │
                                              └──► Armazenamento Local (/backend/uploads)

```

* **Frontend:** HTML5 semântico, CSS3 (Bootstrap) e JavaScript ES6+ com uso nativo da *Geolocation API* e *FileReader API* (`frontend/`).

* **Backend:** Node.js com Express (API RESTful sobre HTTP/JSON e suporte a `multipart/form-data` para upload de imagens), responsável pela validação de regras de negócio e geração automática de protocolos (`backend/`).

* **Banco de dados:** MySQL / MariaDB (`cidadao_conecta_db`), estruturado com integridade referencial entre as entidades `Categoria` e `Chamado` (`database/`).

* **Dados de exemplo:** 4 categorias de zeladoria urbana (SEINF, ACFOR, ENEL, CAGECE) e 1 chamado inicial de demonstração da Persona 1.

### Modelagem de dados

| Tabela | Campos | 
| ----- | ----- | 
| **Categoria** | `id_categoria` (PK), `nome_categoria`, `orgao_responsavel` | 
| **Chamado** | `id_chamado` (PK), `protocolo`, `id_categoria` (FK), `descricao`, `latitude`, `longitude`, `ponto_referencia`, `caminho_foto`, `status_chamado`, `data_abertura` | 

## 3. Como executar

**Pré-requisitos:** Node.js (v18+), MySQL/MariaDB (ou XAMPP) e navegador moderno (Edge ou Chrome).

### Passo 1: Configurar o banco de dados

1. Inicie o serviço do MySQL em sua máquina local.

2. Execute o script `database/DDL_Criacao_Tabelas.sql` para criar o banco `cidadao_conecta_db` e as tabelas.

3. Execute o script `database/DML_Insercao_Dados.sql` para popular as categorias iniciais de Fortaleza.

### Passo 2: Iniciar o Backend (API REST)

```
cd backend
npm install
npm start

```

*O servidor será iniciado por padrão em `http://localhost:3000`.*

### Passo 3: Executar o Frontend

1. Abra o arquivo `frontend/index.html` diretamente no navegador (ou utilize a extensão *Live Server* do VS Code).

2. Certifique-se de conceder permissão de localização ao navegador quando solicitado pelo botão **"Usar Minha Localização Atual"** (ou preencha manualmente o campo de ponto de referência).

## 4. Endpoints e Validações (Testes)

A comunicação entre as camadas foi validada por meio dos seguintes endpoints REST:

* `GET /api/categorias` — Retorna a lista JSON das categorias cadastradas no banco para preenchimento do formulário.

* `POST /api/chamados` — Valida os campos obrigatórios, salva a imagem em `backend/uploads/`, gera o código único no formato `#CC-2026-XXXX` e persiste o registro no MySQL.

* `GET /api/chamados/:protocolo` — Consulta e retorna detalhes e o status atual (`Aberto`) de um chamado pelo número de protocolo.

## 5. Estrutura de pastas

```
cidadao-conecta-poc/
├── frontend/
│   ├── index.html            # Tela inicial (acesso rápido e consulta de protocolo)
│   ├── novo-chamado.html     # Formulário de registro com GPS e pré-visualização de foto
│   └── js/app.js             # Consumo da API (Fetch), Geolocation API e validações
├── backend/
│   ├── server.js             # Servidor Express, rotas REST e geração de protocolo
│   ├── db.js                 # Configuração de conexão com o MySQL
│   └── uploads/              # Diretório de armazenamento das evidências fotográficas
├── database/
│   ├── DDL_Criacao_Tabelas.sql   # Criação do schema e chaves estrangeiras
│   └── DML_Insercao_Dados.sql    # Carga inicial de categorias e registro de teste
├── demo/
│   └── demo_cidadao_conecta.mp4  # Vídeo demonstrativo da PoC
└── README.md                 # Documentação técnica do repositório

```
