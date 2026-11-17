/*
 * tabela.js — adicionar e remover linhas das tabelas de aluno e professor.
 *
 * Cada <table data-tabela="chave"> ganha:
 *  - uma coluna "Ação" com o botão Remover em cada linha (evento click);
 *  - um formulário "Adicionar item" montado a partir do cabeçalho (evento submit);
 *  - persistência no localStorage; "Restaurar dados originais" volta ao HTML.
 *
 * As linhas que já estão no HTML são os dados originais. Os tipos de campo de
 * cada tabela ficam em CONFIG (na mesma ordem das colunas do <thead>).
 */
(function () {
  'use strict';

  var PREFIXO = 'sge_tabela_';
  var TAMANHO_MAX_TEXTO = 60;
  var VAZIO = '—';

  // ---------- configuração dos campos de cada tabela ----------
  // t: texto | inteiro | nota | data | select | auto
  // opc: campo opcional | ph: placeholder | sufixo: texto fixo após o número

  var texto = function (ph) { return { t: 'texto', ph: ph || '' }; };
  var inteiro = function (min, max, ph, sufixo) {
    return { t: 'inteiro', min: min, max: max, ph: ph || '', sufixo: sufixo || '' };
  };
  var nota = function (opc) { return { t: 'nota', opc: !!opc, ph: '0 a 10' }; };
  var escolha = function (opcoes) { return { t: 'select', opcoes: opcoes }; };
  var auto = { t: 'auto' };

  function media(valores, indices) {
    var soma = 0, n = 0;
    indices.forEach(function (i) {
      if (valores[i] !== '') {
        soma += Number(valores[i].replace(',', '.'));
        n++;
      }
    });
    return n === 0 ? VAZIO : formatarNota(soma / n);
  }

  var CONFIG = {
    // Aluno
    disciplinas: {
      campos: [texto('MAT101'), texto('Matemática'), texto('Nome do professor'), inteiro(1, 400, '80', 'h')]
    },
    horarios: {
      campos: [
        texto('07:30 – 08:20'),
        { t: 'texto', opc: true }, { t: 'texto', opc: true }, { t: 'texto', opc: true },
        { t: 'texto', opc: true }, { t: 'texto', opc: true }
      ]
    },
    notas: {
      campos: [texto('Disciplina'), nota(true), nota(true), nota(true), nota(true), auto],
      calcular: function (v) { v[5] = media(v, [1, 2, 3, 4]); return null; }
    },
    frequencia: {
      campos: [texto('Disciplina'), inteiro(1, 999, '40'), inteiro(0, 999, '38'), auto, auto],
      calcular: function (v) {
        var dadas = parseInt(v[1], 10), presencas = parseInt(v[2], 10);
        if (presencas > dadas) { return 'As presenças não podem ser maiores que as aulas dadas.'; }
        v[3] = String(dadas - presencas);
        v[4] = Math.round((presencas / dadas) * 100) + '%';
        return null;
      }
    },

    // Professor
    turmas: {
      campos: [texto('6º A'), texto('Matemática'), escolha(['Manhã', 'Tarde', 'Noite']), inteiro(1, 60, '30'), texto('101')]
    },
    planosaula: {
      campos: [{ t: 'data' }, texto('6º A'), texto('Conteúdo da aula'), escolha(['Planejado', 'Em andamento', 'Concluído'])]
    },
    lancarnotas: {
      campos: [inteiro(1, 99999999, '20260101'), texto('Nome do aluno'), texto('6º A'), texto('1ª Prova'), nota(false)]
    },
    regfreq: {
      campos: [inteiro(1, 99999999, '20260101'), texto('Nome do aluno'), texto('6º A'), { t: 'data' }, escolha(['Presente', 'Ausente', 'Justificada'])]
    }
  };

  // ---------- utilitários ----------

  function formatarNota(numero) {
    return numero.toFixed(1).replace('.', ',');
  }

  function tentar(fn, padrao) {
    try { return fn(); } catch (e) { return padrao; }
  }

  function el(tag, classe, conteudo) {
    var e = document.createElement(tag);
    if (classe) { e.className = classe; }
    if (conteudo !== undefined) { e.textContent = conteudo; }
    return e;
  }

  // ---------- validação de cada tipo de campo ----------
  // Devolve { valor } quando está certo ou { erro } com a mensagem.

  function validarCampo(campo, bruto, rotulo) {
    var valor = bruto.trim();

    if (valor === '') {
      return campo.opc ? { valor: '' } : { erro: 'Preencha o campo "' + rotulo + '".' };
    }

    switch (campo.t) {
      case 'inteiro':
        if (!/^\d+$/.test(valor)) {
          return { erro: 'O campo "' + rotulo + '" deve conter apenas números inteiros.' };
        }
        var n = parseInt(valor, 10);
        if (n < campo.min || n > campo.max) {
          return { erro: 'O campo "' + rotulo + '" deve estar entre ' + campo.min + ' e ' + campo.max + '.' };
        }
        return { valor: String(n) + campo.sufixo };

      case 'nota':
        var normal = valor.replace(',', '.');
        if (!/^\d+(\.\d+)?$/.test(normal)) {
          return { erro: 'A nota em "' + rotulo + '" deve ser um número, como 7,5.' };
        }
        var nt = Number(normal);
        if (nt < 0 || nt > 10) {
          return { erro: 'A nota em "' + rotulo + '" deve estar entre 0 e 10.' };
        }
        return { valor: formatarNota(nt) };

      case 'data':
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
        if (!m) { return { erro: 'Informe uma data válida em "' + rotulo + '".' }; }
        return { valor: m[3] + '/' + m[2] + '/' + m[1] };

      case 'select':
        if (campo.opcoes.indexOf(valor) === -1) {
          return { erro: 'Escolha uma opção válida em "' + rotulo + '".' };
        }
        return { valor: valor };

      default: // texto
        if (valor.length > TAMANHO_MAX_TEXTO) {
          return { erro: 'O campo "' + rotulo + '" aceita no máximo ' + TAMANHO_MAX_TEXTO + ' caracteres.' };
        }
        return { valor: valor };
    }
  }

  // ---------- uma tabela ----------

  function configurarTabela(tabela) {
    var chave = tabela.getAttribute('data-tabela');
    var configuracao = CONFIG[chave] || {};
    var tbody = tabela.tBodies[0];
    var cabecalhoLinha = tabela.tHead.rows[0];
    var rotulos = Array.prototype.map.call(cabecalhoLinha.cells, function (th) {
      return th.textContent.trim();
    });
    var campos = rotulos.map(function (_, i) {
      return (configuracao.campos && configuracao.campos[i]) || texto();
    });

    // Algumas tabelas (horários) usam <th scope="row"> na primeira coluna.
    var primeiraEhTh = tbody.rows.length > 0 && tbody.rows[0].cells[0].tagName === 'TH';

    function lerLinhasDoHtml() {
      return Array.prototype.map.call(tbody.rows, function (tr) {
        return Array.prototype.map.call(tr.cells, function (c) { return c.textContent.trim(); });
      });
    }

    var originais = lerLinhasDoHtml();

    function linhasSalvas() {
      var salvo = tentar(function () { return JSON.parse(localStorage.getItem(PREFIXO + chave)); }, null);
      var valido = Array.isArray(salvo) && salvo.every(function (linha) {
        return Array.isArray(linha) && linha.length === rotulos.length;
      });
      return valido ? salvo : null;
    }

    var linhas = linhasSalvas() || originais.map(function (l) { return l.slice(); });

    function salvar() {
      tentar(function () { localStorage.setItem(PREFIXO + chave, JSON.stringify(linhas)); });
    }

    // ----- cabeçalho com a coluna de ação -----
    var thAcao = el('th', 'col-acao', 'Ação');
    thAcao.setAttribute('scope', 'col');
    cabecalhoLinha.appendChild(thAcao);

    // ----- desenho das linhas -----
    function desenhar() {
      tbody.textContent = '';

      if (linhas.length === 0) {
        var vazia = el('tr', 'linha-vazia');
        var td = el('td', '', 'Nenhum registro. Use o formulário abaixo para adicionar.');
        td.setAttribute('colspan', String(rotulos.length + 1));
        vazia.appendChild(td);
        tbody.appendChild(vazia);
        return;
      }

      linhas.forEach(function (linha, indice) {
        var tr = el('tr');
        linha.forEach(function (valor, i) {
          var celula = (i === 0 && primeiraEhTh) ? el('th', '', valor) : el('td', '', valor === '' ? VAZIO : valor);
          if (i === 0 && primeiraEhTh) { celula.setAttribute('scope', 'row'); }
          tr.appendChild(celula);
        });

        var tdAcao = el('td', 'col-acao');
        var botao = el('button', 'botao-remover', 'Remover');
        botao.type = 'button';
        botao.setAttribute('data-indice', String(indice));
        botao.setAttribute('aria-label', 'Remover a linha de ' + (linha[0] || 'item ' + (indice + 1)));
        tdAcao.appendChild(botao);
        tr.appendChild(tdAcao);

        tbody.appendChild(tr);
      });
    }

    // ----- formulário de adição -----
    var form = el('form', 'form-adicionar');
    form.setAttribute('novalidate', '');
    form.setAttribute('aria-label', 'Adicionar item à tabela');

    form.appendChild(el('h2', '', 'Adicionar item'));

    var grade = el('div', 'campos');
    var entradas = []; // entradas[i] é o <input>/<select> da coluna i (ou null se for automática)

    campos.forEach(function (campo, i) {
      if (campo.t === 'auto') { entradas[i] = null; return; }

      var id = 'campo-' + chave + '-' + i;
      var rotulo = el('label', '', rotulos[i] + (campo.opc ? ' (opcional)' : ''));
      rotulo.setAttribute('for', id);

      var entrada;
      if (campo.t === 'select') {
        entrada = el('select');
        var inicial = el('option', '', 'Selecione');
        inicial.value = '';
        entrada.appendChild(inicial);
        campo.opcoes.forEach(function (opcao) {
          var o = el('option', '', opcao);
          o.value = opcao;
          entrada.appendChild(o);
        });
      } else {
        entrada = el('input');
        if (campo.t === 'inteiro') {
          entrada.type = 'number';
          entrada.min = String(campo.min);
          entrada.max = String(campo.max);
          entrada.step = '1';
        } else if (campo.t === 'data') {
          entrada.type = 'date';
        } else {
          entrada.type = 'text';
          if (campo.t === 'nota') { entrada.setAttribute('inputmode', 'decimal'); }
          else { entrada.maxLength = TAMANHO_MAX_TEXTO; }
        }
        if (campo.ph) { entrada.placeholder = campo.ph; }
      }
      entrada.id = id;
      entrada.name = id;
      entradas[i] = entrada;

      var grupo = el('div', 'campo');
      grupo.appendChild(rotulo);
      grupo.appendChild(entrada);
      grade.appendChild(grupo);
    });
    form.appendChild(grade);

    var mensagem = el('p', 'mensagem');
    mensagem.setAttribute('role', 'status');
    mensagem.setAttribute('aria-live', 'polite');

    function mostrar(texto, ehErro) {
      mensagem.textContent = texto;
      mensagem.className = 'mensagem ' + (ehErro ? 'erro' : 'ok');
    }

    var acoes = el('div', 'acoes-form');
    var botaoAdicionar = el('button', 'botao-primario', 'Adicionar');
    botaoAdicionar.type = 'submit';
    var botaoRestaurar = el('button', 'botao-secundario', 'Restaurar dados originais');
    botaoRestaurar.type = 'button';
    acoes.appendChild(botaoAdicionar);
    acoes.appendChild(botaoRestaurar);
    form.appendChild(acoes);
    form.appendChild(mensagem);

    // ----- evento submit: valida e adiciona -----
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var valores = [];
      for (var i = 0; i < campos.length; i++) {
        if (campos[i].t === 'auto') { valores[i] = ''; continue; }

        // Em <input type="number">, texto inválido (como "abc" ou "1e") chega
        // como value vazio com badInput = true; sem esta checagem pareceria "campo vazio".
        if (entradas[i].validity && entradas[i].validity.badInput) {
          mostrar('O campo "' + rotulos[i] + '" deve conter apenas números inteiros.', true);
          entradas[i].focus();
          return;
        }

        var resultado = validarCampo(campos[i], entradas[i].value, rotulos[i]);
        if (resultado.erro) {
          mostrar(resultado.erro, true);
          entradas[i].focus();
          return;
        }
        valores[i] = resultado.valor;
      }

      if (configuracao.calcular) {
        var erroRegra = configuracao.calcular(valores);
        if (erroRegra) { mostrar(erroRegra, true); return; }
      }

      linhas.push(valores);
      salvar();
      desenhar();
      form.reset();
      mostrar('Linha adicionada.', false);
      var primeira = entradas.filter(Boolean)[0];
      if (primeira) { primeira.focus(); }
    });

    // Limpa o aviso assim que a pessoa volta a editar.
    form.addEventListener('input', function () { mostrar('', false); });

    // ----- evento click: restaurar -----
    botaoRestaurar.addEventListener('click', function () {
      if (!window.confirm('Voltar a tabela aos dados originais? As alterações feitas serão perdidas.')) { return; }
      linhas = originais.map(function (l) { return l.slice(); });
      salvar();
      desenhar();
      mostrar('Dados originais restaurados.', false);
    });

    // ----- evento click: remover (delegação no tbody) -----
    tbody.addEventListener('click', function (evento) {
      var botao = evento.target.closest ? evento.target.closest('.botao-remover') : null;
      if (!botao || !tbody.contains(botao)) { return; }

      var indice = parseInt(botao.getAttribute('data-indice'), 10);
      if (isNaN(indice) || indice < 0 || indice >= linhas.length) { return; }

      var nome = linhas[indice][0] || 'esta linha';
      if (!window.confirm('Remover "' + nome + '" da tabela?')) { return; }

      linhas.splice(indice, 1);
      salvar();
      desenhar();
      mostrar('Linha removida.', false);
    });

    // Monta a página.
    desenhar();
    var wrapper = tabela.closest('.tabela-wrapper');
    wrapper.parentNode.insertBefore(form, wrapper.nextSibling);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var tabelas = document.querySelectorAll('table[data-tabela]');
    for (var i = 0; i < tabelas.length; i++) { configurarTabela(tabelas[i]); }
  });
})();
