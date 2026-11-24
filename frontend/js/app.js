const API_BASE_URL = window.location.origin.includes('localhost:3000')
  ? ''
  : 'http://localhost:3000';

// Elementos das telas
const telaHome = document.getElementById('telaHome');
const telaFormulario = document.getElementById('telaFormulario');
const telaConfirmacao = document.getElementById('telaConfirmacao');

// Botões de navegação
const btnAbrirFormulario = document.getElementById('btnAbrirFormulario');
const btnCancelarFormulario = document.getElementById('btnCancelarFormulario');
const btnVoltarHomeNav = document.getElementById('btnVoltarHomeNav');
const btnNovoChamadoPosConfirmacao = document.getElementById('btnNovoChamadoPosConfirmacao');

// Elementos do formulário
const formChamado = document.getElementById('formChamado');
const btnObterGPS = document.getElementById('btnObterGPS');
const inputLatitude = document.getElementById('latitude');
const inputLongitude = document.getElementById('longitude');
const statusGPS = document.getElementById('statusGPS');
const selectCategoria = document.getElementById('idCategoria');
const inputFoto = document.getElementById('foto');
const previewContainer = document.getElementById('previewContainer');
const previewImagem = document.getElementById('previewImagem');
const alertaErroForm = document.getElementById('alertaErroForm');
const btnEnviarChamado = document.getElementById('btnEnviarChamado');

// Elementos de consulta
const formConsultaProtocolo = document.getElementById('formConsultaProtocolo');
const inputProtocoloConsulta = document.getElementById('inputProtocoloConsulta');
const resultadoConsulta = document.getElementById('resultadoConsulta');

// Alternância de telas
function mostrarTela(tela) {
  telaHome.classList.add('d-none');
  telaFormulario.classList.add('d-none');
  telaConfirmacao.classList.add('d-none');
  tela.classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

btnAbrirFormulario.addEventListener('click', () => {
  limparFormulario();
  carregarCategorias();
  mostrarTela(telaFormulario);
});

btnCancelarFormulario.addEventListener('click', () => mostrarTela(telaHome));
btnVoltarHomeNav.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarTela(telaHome);
});
btnNovoChamadoPosConfirmacao.addEventListener('click', () => mostrarTela(telaHome));

// Carrega categorias do Backend (GET /api/categorias)
async function carregarCategorias() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/categorias`);
    if (!resp.ok) throw new Error('Falha ao obter categorias');
    const categorias = await resp.json();

    selectCategoria.innerHTML = '<option value="">Selecione uma categoria...</option>';
    categorias.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.id_categoria;
      opt.textContent = `${cat.nome_categoria} (${cat.orgao_responsavel})`;
      selectCategoria.appendChild(opt);
    });
  } catch (err) {
    selectCategoria.innerHTML = '<option value="">Erro ao carregar categorias (verifique o servidor)</option>';
  }
}

// Geolocalização Automatizada (Geolocation API)
btnObterGPS.addEventListener('click', () => {
  if (!('geolocation' in navigator)) {
    statusGPS.innerHTML = '<span class="text-danger">Seu navegador não suporta geolocalização.</span>';
    return;
  }

  statusGPS.innerHTML = '<span class="text-primary">Obtendo coordenadas GPS...</span>';
  btnObterGPS.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      inputLatitude.value = lat;
      inputLongitude.value = lng;
      statusGPS.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill"></i> Localização capturada com sucesso (${lat}, ${lng}).</span>`;
      btnObterGPS.disabled = false;
    },
    (error) => {
      let msg = 'Não foi possível obter a localização.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Permissão de localização negada pelo navegador. Habilite o GPS para continuar.';
      }
      statusGPS.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i> ${msg}</span>`;
      btnObterGPS.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// Pré-visualização Instantânea de Mídia (FileReader API)
inputFoto.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    previewContainer.classList.add('d-none');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    previewImagem.src = event.target.result;
    previewContainer.classList.remove('d-none');
  };
  reader.readAsDataURL(file);
});

// Envio do Formulário (POST /api/chamados)
formChamado.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertaErroForm.classList.add('d-none');

  const latitude = inputLatitude.value.trim();
  const longitude = inputLongitude.value.trim();
  const idCategoria = selectCategoria.value;
  const descricao = document.getElementById('descricao').value.trim();

  // Validação preventiva no cliente
  if (!latitude || !longitude || !idCategoria || !descricao) {
    alertaErroForm.innerHTML =
      '<i class="bi bi-exclamation-triangle-fill me-1"></i> <strong>Erro de validação:</strong> Capture a localização GPS, selecione uma categoria e preencha a descrição antes de registrar o chamado.';
    alertaErroForm.classList.remove('d-none');
    return;
  }

  const formData = new FormData(formChamado);
  btnEnviarChamado.disabled = true;
  btnEnviarChamado.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';

  try {
    const resp = await fetch(`${API_BASE_URL}/api/chamados`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.erro || 'Erro ao registrar chamado.');
    }

    exibirConfirmacao(data.chamado);
  } catch (err) {
    alertaErroForm.innerHTML = `<i class="bi bi-x-circle-fill me-1"></i> ${err.message}`;
    alertaErroForm.classList.remove('d-none');
  } finally {
    btnEnviarChamado.disabled = false;
    btnEnviarChamado.innerHTML = '<i class="bi bi-send-fill me-2"></i>Registrar Chamado';
  }
});

// Tela 3: Exibe detalhes e protocolo gerado
function exibirConfirmacao(chamado) {
  document.getElementById('protocoloGerado').textContent = chamado.protocolo;
  document.getElementById('resumoChamado').innerHTML = `
    <p class="mb-1"><strong>Categoria:</strong> ${chamado.nome_categoria}</p>
    <p class="mb-1"><strong>Órgão Responsável:</strong> ${chamado.orgao_responsavel}</p>
    <p class="mb-1"><strong>Coordenadas:</strong> ${chamado.latitude}, ${chamado.longitude}</p>
    ${chamado.ponto_referencia ? `<p class="mb-1"><strong>Referência:</strong> ${chamado.ponto_referencia}</p>` : ''}
    <p class="mb-1"><strong>Descrição:</strong> ${chamado.descricao}</p>
    <p class="mb-0"><strong>Status Atual:</strong> <span class="badge bg-warning text-dark">${chamado.status_chamado}</span></p>
  `;
  mostrarTela(telaConfirmacao);
}

// Consulta de Protocolo na Tela Inicial (GET /api/chamados/:protocolo)
formConsultaProtocolo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const protocolo = inputProtocoloConsulta.value.trim();
  if (!protocolo) return;

  resultadoConsulta.classList.remove('d-none');
  resultadoConsulta.innerHTML = '<div class="text-muted small">Consultando protocolo...</div>';

  try {
    const encoded = encodeURIComponent(protocolo);
    const resp = await fetch(`${API_BASE_URL}/api/chamados/${encoded}`);
    const data = await resp.json();

    if (!resp.ok) {
      resultadoConsulta.innerHTML = `<div class="alert alert-warning mb-0 py-2 small">${data.erro}</div>`;
      return;
    }

    resultadoConsulta.innerHTML = `
      <div class="alert alert-info mb-0 small">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>Protocolo: ${data.protocolo}</strong>
          <span class="badge bg-primary">${data.status_chamado}</span>
        </div>
        <div><strong>Categoria:</strong> ${data.nome_categoria}</div>
        <div><strong>Órgão:</strong> ${data.orgao_responsavel}</div>
        <div><strong>Descrição:</strong> ${data.descricao}</div>
      </div>
    `;
  } catch (err) {
    resultadoConsulta.innerHTML =
      '<div class="alert alert-danger mb-0 py-2 small">Erro ao conectar com o servidor.</div>';
  }
});

function limparFormulario() {
  formChamado.reset();
  inputLatitude.value = '';
  inputLongitude.value = '';
  previewContainer.classList.add('d-none');
  alertaErroForm.classList.add('d-none');
  statusGPS.innerHTML = 'Clique no botão acima para capturar suas coordenadas automaticamente.';
}
