// ============================================================
// BOLETIM DIGITAL — 8º ANO
// Dados fictícios + cálculos + preenchimento automático da tela
// ============================================================

// ------------------------------------------------------------
// CONCEITO: array
// Um array é uma lista. Aqui, é a lista das disciplinas.
// CONCEITO: objeto
// Cada item da lista é um objeto: guarda várias informações
// juntas (disciplina, tri1, tri2, tri3, faltas).
// ------------------------------------------------------------
const disciplinas = [
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

// ------------------------------------------------------------
// CONCEITO: função
// Uma função é um bloco de código que faz uma tarefa específica.
// Esta normaliza qualquer nota para a escala 0–10.
// ------------------------------------------------------------
function normalizarNota(valor) {
  // Vazio, null ou undefined = nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Aceita ponto ou vírgula decimal: "7,8" -> 7.8
  let numero = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;

  // Se não for número válido, considera inválido
  if (isNaN(numero)) {
    return null;
  }

  // Entre 0 e 10: permanece igual
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Maior que 10 e menor ou igual a 100: divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras: inválido
  return null;
}

// ------------------------------------------------------------
// Calcula a média de uma disciplina usando SOMENTE notas válidas.
// Nota ausente nunca vira zero.
// ------------------------------------------------------------
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null; // nenhuma nota válida
  }

  const soma = validas.reduce(function (total, n) {
    return total + n;
  }, 0);

  return soma / validas.length;
}

// ------------------------------------------------------------
// Soma as faltas dos três trimestres.
// ------------------------------------------------------------
function somarFaltas(faltas) {
  return faltas.reduce(function (total, f) {
    return total + f;
  }, 0);
}

// ------------------------------------------------------------
// Define a situação da disciplina.
// CONCEITO: if
// O "if" toma uma decisão com base em uma condição.
// ------------------------------------------------------------
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

// ------------------------------------------------------------
// Formata número para exibir com uma casa decimal (ex.: 8.2 -> "8,2")
// ------------------------------------------------------------
function formatarNota(n) {
  if (n === null) return "—";
  return n.toFixed(1).replace(".", ",");
}

// ------------------------------------------------------------
// CONCEITO: DOM
// DOM é a representação da página HTML dentro do JavaScript.
// Com ele conseguimos pegar elementos e alterar seu conteúdo.
// ------------------------------------------------------------

// Pega o <tbody> onde as linhas da tabela serão inseridas
const corpoTabela = document.getElementById("corpoTabela");

// Pega a área onde os cards serão inseridos
const areaCards = document.getElementById("cardsResumo");

// ------------------------------------------------------------
// CONCEITO: forEach
// O forEach percorre cada item de um array.
// Usamos aqui para criar uma linha de tabela para cada disciplina.
// ------------------------------------------------------------
function montarTabela() {
  disciplinas.forEach(function (item) {
    // Normaliza as três notas
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula média e faltas
    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(item.faltas);
    const situacao = definirSituacao(media);

    // Define a classe CSS conforme a situação
    let classeSituacao = "situacao-indisponivel";
    if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    else if (situacao === "Atenção") classeSituacao = "situacao-atencao";

    // Cria a linha <tr> e insere dentro do <tbody>
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${item.disciplina}</td>
      <td>${formatarNota(n1)}</td>
      <td>${formatarNota(n2)}</td>
      <td>${formatarNota(n3)}</td>
      <td>${media === null ? "—" : formatarNota(media)}</td>
      <td>${totalFaltas}</td>
      <td class="${classeSituacao}">${situacao}</td>
    `;
    corpoTabela.appendChild(linha);
  });
}

// ------------------------------------------------------------
// Monta os cards de resumo no topo da página.
// ------------------------------------------------------------
function montarCards() {
  // Arrays auxiliares para estatísticas
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

  // Média geral (só das notas válidas)
  const mediaGeral = medias.length > 0
    ? medias.reduce((t, m) => t + m, 0) / medias.length
    : null;

  // Frequência FICTÍCIA / DEMONSTRATIVA (não vem das faltas).
  // No futuro, este valor será tratado de outra forma.
  const frequenciaDemonstrativa = 92;

  // Lista de cards a exibir
  const cards = [
    {
      rotulo: "Média geral",
      valor: mediaGeral === null ? "—" : formatarNota(mediaGeral),
      extra: ""
    },
    {
      rotulo: "Total de faltas",
      valor: totalFaltas,
      extra: ""
    },
    {
      rotulo: "Bom desempenho",
      valor: bomDesempenho,
      extra: "disciplinas"
    },
    {
      rotulo: "Precisam de atenção",
      valor: atencao,
      extra: "disciplinas"
    },
    {
      rotulo: "Frequência",
      valor: frequenciaDemonstrativa + "%",
      extra: "Frequência adequada"
    }
  ];

  // Cria cada card e adiciona na área
  cards.forEach(function (c) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="rotulo">${c.rotulo}</div>
      <div class="valor">${c.valor}</div>
      <div class="extra">${c.extra}</div>
    `;
    areaCards.appendChild(div);
  });
}

// ------------------------------------------------------------
// Inicia tudo quando a página carregar
// ------------------------------------------------------------
montarCards();
montarTabela();