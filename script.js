// ============================================================
// BOLETIM DIGITAL — 8º ANO (TURMA 8C — Nº 30)
// Integração com API + Edição + Preservação do Visual Existente
// ============================================================

// CONFIGURAÇÃO FIXA DO ALUNO (Não alterar)
const CONFIG_ALUNO = {
  turma: "8C",
  numeroChamada: 30,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variavel de sessão para armazenar o PIN em memória
let pinSessao = "";

// ------------------------------------------------------------
// DADOS LOCAIS (FALLBACK)
// Usados quando a API não possuir dados salvos ainda.
// ------------------------------------------------------------
let disciplinas = [
  { disciplina: "Língua Portuguesa",        tri1: 82,   tri2: "7,8", tri3: 85,   faltas: [2, 1, 1] },
  { disciplina: "Matemática",               tri1: 52,   tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências",                 tri1: "8,1",tri2: 76,    tri3: 8.0,  faltas: [1, 2, 0] },
  { disciplina: "História",                 tri1: 7.0,  tri2: 84,    tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia",                tri1: 68,   tri2: 7.3,   tri3: "7,9",faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",           tri1: 86,   tri2: "8,1", tri3: 8.7,  faltas: [1, 0, 0] },
  { disciplina: "Arte",                     tri1: 9.0,  tri2: 92,    tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física",          tri1: 95,   tri2: 9.0,   tri3: "9,4",faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",         tri1: 88,   tri2: 9.1,   tri3: 93,   faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira",      tri1: 74,   tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado",         tri1: 8.0,  tri2: 83,    tri3: "8,5",faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura",        tri1: 62,   tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico",        tri1: 48,   tri2: 5.6,   tri3: "6,0",faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais",   tri1: 58,   tri2: "6,2", tri3: 6.4,  faltas: [1, 1, 1] }
];

// Média mínima de referência
const MEDIA_MINIMA = 6.0;

// Referência interna de risco para faltas totais
const LIMITE_RISCO_FALTAS = 350;

// Instâncias dos gráficos
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// ------------------------------------------------------------
// NORMALIZAÇÃO E CÁLCULOS
// ------------------------------------------------------------
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce(function (total, n) {
    return total + n;
  }, 0);

  return soma / validas.length;
}

function somarFaltas(faltas) {
  if (!Array.isArray(faltas)) return 0;
  return faltas.reduce(function (total, f) {
    const num = parseInt(f, 10);
    return total + (isNaN(num) ? 0 : num);
  }, 0);
}

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

function formatarNota(n) {
  if (n === null) return "—";
  return n.toFixed(1).replace(".", ",");
}

// ------------------------------------------------------------
// ELEMENTOS DO DOM
// ------------------------------------------------------------
const corpoTabela = document.getElementById("corpoTabela");
const areaCards = document.getElementById("cardsResumo");
const areaAcesso = document.getElementById("areaAcesso");
const areaBoletim = document.getElementById("areaBoletim");
const areaEdicao = document.getElementById("areaEdicao");
const corpoTabelaEdicao = document.getElementById("corpoTabelaEdicao");

const pinInput = document.getElementById("pinInput");
const btnEntrar = document.getElementById("btnEntrar");
const mensagemAcesso = document.getElementById("mensagemAcesso");

const btnAlterarDados = document.getElementById("btnAlterarDados");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const mensagemEdicao = document.getElementById("mensagemEdicao");

// ------------------------------------------------------------
// RENDERIZAÇÃO DA TABELA E CARDS
// ------------------------------------------------------------
function montarTabela() {
  corpoTabela.innerHTML = "";

  disciplinas.forEach(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(item.faltas);
    const situacao = definirSituacao(media);

    let classeSituacao = "situacao-indisponivel";
    if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    else if (situacao === "Atenção") classeSituacao = "situacao-atencao";

    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = item.disciplina;

    const td1 = document.createElement("td");
    td1.textContent = formatarNota(n1);

    const td2 = document.createElement("td");
    td2.textContent = formatarNota(n2);

    const td3 = document.createElement("td");
    td3.textContent = formatarNota(n3);

    const tdMedia = document.createElement("td");
    tdMedia.textContent = media === null ? "—" : formatarNota(media);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltas;

    const tdSit = document.createElement("td");
    tdSit.className = classeSituacao;
    tdSit.textContent = situacao;

    linha.appendChild(tdNome);
    linha.appendChild(td1);
    linha.appendChild(td2);
    linha.appendChild(td3);
    linha.appendChild(tdMedia);
    linha.appendChild(tdFaltas);
    linha.appendChild(tdSit);

    corpoTabela.appendChild(linha);
  });
}

function montarCards() {
  areaCards.innerHTML = "";

  const medias = [];
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  disciplinas.forEach(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);

    if (media !== null) {
      medias.push(media);
      if (media >= MEDIA_MINIMA) bomDesempenho++;
      else atencao++;
    }

    totalFaltas += somarFaltas(item.faltas);
  });

  const mediaGeral = medias.length > 0
    ? medias.reduce((t, m) => t + m, 0) / medias.length
    : null;

  const frequenciaDemonstrativa = 92;

  const cards = [
    { rotulo: "Média geral", valor: mediaGeral === null ? "—" : formatarNota(mediaGeral), extra: "" },
    { rotulo: "Total de faltas", valor: totalFaltas, extra: "" },
    { rotulo: "Bom desempenho", valor: bomDesempenho, extra: "disciplinas" },
    { rotulo: "Precisam de atenção", valor: atencao, extra: "disciplinas" },
    { rotulo: "Frequência", valor: frequenciaDemonstrativa + "%", extra: "Frequência adequada" }
  ];

  cards.forEach(function (c) {
    const div = document.createElement("div");
    div.className = "card";

    const divRotulo = document.createElement("div");
    divRotulo.className = "rotulo";
    divRotulo.textContent = c.rotulo;

    const divValor = document.createElement("div");
    divValor.className = "valor";
    divValor.textContent = c.valor;

    const divExtra = document.createElement("div");
    divExtra.className = "extra";
    divExtra.textContent = c.extra;

    div.appendChild(divRotulo);
    div.appendChild(divValor);
    div.appendChild(divExtra);

    areaCards.appendChild(div);
  });
}

function atualizarTela() {
  montarCards();
  montarTabela();
  atualizarGraficos();
}

// ------------------------------------------------------------
// FUNÇÕES EXCLUSIVAS DOS GRÁFICOS (SOMENTE LEITURA)
// ------------------------------------------------------------
function atualizarGraficoMedias() {
  const ctx = document.getElementById("graficoMediasDisciplinas");
  if (!ctx) return;

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  const rotulos = [];
  const valores = [];

  disciplinas.forEach(function (item) {
    rotulos.push(item.disciplina);
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);
    valores.push(media);
  });

  graficoMedias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [{
        label: "Média",
        data: valores,
        backgroundColor: "#3b82f6",
        borderColor: "#60a5fa",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Média: —";
              return " Média: " + val.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { color: "#94a3b8" },
          grid: { color: "#1e3a8a" }
        },
        y: {
          ticks: { color: "#e2e8f0", font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const ctx = document.getElementById("graficoEvolucaoTrimestres");
  if (!ctx) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  const tri1Notas = [];
  const tri2Notas = [];
  const tri3Notas = [];

  disciplinas.forEach(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    if (n1 !== null) tri1Notas.push(n1);
    if (n2 !== null) tri2Notas.push(n2);
    if (n3 !== null) tri3Notas.push(n3);
  });

  const m1 = tri1Notas.length > 0 ? tri1Notas.reduce((a, b) => a + b, 0) / tri1Notas.length : null;
  const m2 = tri2Notas.length > 0 ? tri2Notas.reduce((a, b) => a + b, 0) / tri2Notas.length : null;
  const m3 = tri3Notas.length > 0 ? tri3Notas.reduce((a, b) => a + b, 0) / tri3Notas.length : null;

  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: [m1, m2, m3],
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96, 165, 250, 0.15)",
        borderWidth: 3,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointRadius: 5,
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Média Geral: —";
              return " Média Geral: " + val.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { color: "#94a3b8" },
          grid: { color: "#1e3a8a" }
        },
        x: {
          ticks: { color: "#e2e8f0" },
          grid: { display: false }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const ctx = document.getElementById("graficoFaltasTrimestres");
  const elEstado = document.getElementById("estadoFaltas");
  if (!ctx) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  let f1Total = 0;
  let f2Total = 0;
  let f3Total = 0;

  disciplinas.forEach(function (item) {
    if (Array.isArray(item.faltas)) {
      const v1 = parseInt(item.faltas[0], 10);
      const v2 = parseInt(item.faltas[1], 10);
      const v3 = parseInt(item.faltas[2], 10);

      f1Total += isNaN(v1) ? 0 : v1;
      f2Total += isNaN(v2) ? 0 : v2;
      f3Total += isNaN(v3) ? 0 : v3;
    }
  });

  const totalAcumuladoFaltas = f1Total + f2Total + f3Total;
  const estaEmPerigo = totalAcumuladoFaltas >= LIMITE_RISCO_FALTAS;

  const cardFaltas = ctx.closest(".grafico-card");
  if (cardFaltas) {
    if (estaEmPerigo) {
      cardFaltas.classList.add("card-perigo");
    } else {
      cardFaltas.classList.remove("card-perigo");
    }
  }

  if (elEstado) {
    if (estaEmPerigo) {
      elEstado.innerHTML = '<span class="badge-perigo">Perigo</span>';
    } else {
      elEstado.innerHTML = '';
    }
  }

  graficoFaltas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [f1Total, f2Total, f3Total],
        backgroundColor: "#60a5fa",
        borderColor: "#3b82f6",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              return " " + val + " faltas";
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#94a3b8", precision: 0 },
          grid: { color: "#1e3a8a" }
        },
        x: {
          ticks: { color: "#e2e8f0" },
          grid: { display: false }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// ------------------------------------------------------------
// API — CONEXÃO E LOGIN
// ------------------------------------------------------------
async function entrarNoBoletim() {
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    mensagemAcesso.className = "mensagem-status erro";
    mensagemAcesso.textContent = "Por favor, digite seu PIN.";
    return;
  }

  mensagemAcesso.className = "mensagem-status";
  mensagemAcesso.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      mensagemAcesso.className = "mensagem-status erro";
      mensagemAcesso.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      mensagemAcesso.className = "mensagem-status erro";
      mensagemAcesso.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      mensagemAcesso.className = "mensagem-status erro";
      mensagemAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const resultado = await resposta.json();

    // PIN mantido somente em memória
    pinSessao = pinDigitado;
    pinInput.value = "";

    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      disciplinas = resultado.dados.disciplinas;
    }

    areaAcesso.style.display = "none";
    areaBoletim.style.display = "block";
    mensagemAcesso.textContent = "";

    atualizarTela();

  } catch (erro) {
    mensagemAcesso.className = "mensagem-status erro";
    mensagemAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// ------------------------------------------------------------
// EDIÇÃO E VALIDAÇÃO DE DADOS
// ------------------------------------------------------------
function abrirEdicao() {
  corpoTabelaEdicao.innerHTML = "";
  mensagemEdicao.textContent = "";

  disciplinas.forEach(function (item, index) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const f1 = Array.isArray(item.faltas) ? item.faltas[0] ?? 0 : 0;
    const f2 = Array.isArray(item.faltas) ? item.faltas[1] ?? 0 : 0;
    const f3 = Array.isArray(item.faltas) ? item.faltas[2] ?? 0 : 0;

    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = item.disciplina;

    tr.appendChild(tdNome);

    const inputsInfo = [
      { id: `tri1_${index}`, val: n1 === null ? "" : n1 },
      { id: `tri2_${index}`, val: n2 === null ? "" : n2 },
      { id: `tri3_${index}`, val: n3 === null ? "" : n3 },
      { id: `f1_${index}`, val: f1 },
      { id: `f2_${index}`, val: f2 },
      { id: `f3_${index}`, val: f3 }
    ];

    inputsInfo.forEach(info => {
      const td = document.createElement("td");
      const inp = document.createElement("input");
      inp.type = "text";
      inp.id = info.id;
      inp.value = info.val;
      td.appendChild(inp);
      tr.appendChild(td);
    });

    corpoTabelaEdicao.appendChild(tr);
  });

  areaEdicao.style.display = "flex";
}

function fecharEdicao() {
  areaEdicao.style.display = "none";
  mensagemEdicao.textContent = "";
}

function validarNotaInput(valTexto) {
  const texto = valTexto.trim();
  if (texto === "") return { valido: true, valor: null };

  const normalizado = texto.replace(",", ".");
  const num = Number(normalizado);

  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false };
  }

  return { valido: true, valor: num };
}

function validarFaltaInput(valTexto) {
  const texto = valTexto.trim();
  if (texto === "") return { valido: false };

  const num = Number(texto);

  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valido: false };
  }

  return { valido: true, valor: num };
}

async function salvarEdicao() {
  mensagemEdicao.className = "mensagem-status";
  mensagemEdicao.textContent = "";

  let temErro = false;
  const novasDisciplinas = [];

  for (let i = 0; i < disciplinas.length; i++) {
    const elN1 = document.getElementById(`tri1_${i}`);
    const elN2 = document.getElementById(`tri2_${i}`);
    const elN3 = document.getElementById(`tri3_${i}`);
    const elF1 = document.getElementById(`f1_${i}`);
    const elF2 = document.getElementById(`f2_${i}`);
    const elF3 = document.getElementById(`f3_${i}`);

    [elN1, elN2, elN3, elF1, elF2, elF3].forEach(el => el.classList.remove("input-invalido"));

    const resN1 = validarNotaInput(elN1.value);
    const resN2 = validarNotaInput(elN2.value);
    const resN3 = validarNotaInput(elN3.value);

    const resF1 = validarFaltaInput(elF1.value);
    const resF2 = validarFaltaInput(elF2.value);
    const resF3 = validarFaltaInput(elF3.value);

    if (!resN1.valido) { elN1.classList.add("input-invalido"); temErro = true; }
    if (!resN2.valido) { elN2.classList.add("input-invalido"); temErro = true; }
    if (!resN3.valido) { elN3.classList.add("input-invalido"); temErro = true; }

    if (!resF1.valido) { elF1.classList.add("input-invalido"); temErro = true; }
    if (!resF2.valido) { elF2.classList.add("input-invalido"); temErro = true; }
    if (!resF3.valido) { elF3.classList.add("input-invalido"); temErro = true; }

    if (!temErro) {
      novasDisciplinas.push({
        disciplina: disciplinas[i].disciplina,
        tri1: resN1.valor,
        tri2: resN2.valor,
        tri3: resN3.valor,
        faltas: [resF1.valor, resF2.valor, resF3.valor]
      });
    }
  }

  if (temErro) {
    mensagemEdicao.className = "mensagem-status erro";
    mensagemEdicao.textContent = "Verifique os campos destacados em vermelho. Notas devem ser de 0 a 10 e faltas números inteiros.";
    return;
  }

  mensagemEdicao.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      mensagemEdicao.className = "mensagem-status erro";
      mensagemEdicao.textContent = "Erro ao salvar alterações no servidor. Tente novamente.";
      return;
    }

    disciplinas = novasDisciplinas;
    atualizarTela();

    fecharEdicao();

  } catch (erro) {
    mensagemEdicao.className = "mensagem-status erro";
    mensagemEdicao.textContent = "Falha de rede ao salvar. Tente novamente.";
  }
}

// ------------------------------------------------------------
// EVENTOS
// ------------------------------------------------------------
btnEntrar.addEventListener("click", entrarNoBoletim);
pinInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") entrarNoBoletim();
});

btnAlterarDados.addEventListener("click", abrirEdicao);
btnCancelarEdicao.addEventListener("click", fecharEdicao);
btnSalvar.addEventListener("click", salvarEdicao);