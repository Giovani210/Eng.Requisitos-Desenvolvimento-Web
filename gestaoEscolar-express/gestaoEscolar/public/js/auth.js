/*
 * auth.js — login, proteção de páginas e logout.
 *
 * ATENÇÃO: este projeto não tem servidor. As credenciais abaixo ficam visíveis
 * no navegador, então isto é uma simulação didática de login, não segurança real.
 *
 * Como usar:
 *  - Páginas de login: <form data-login="aluno|professor" data-destino="paginaaluno.html">
 *  - Páginas internas: <html data-perfil="aluno|professor"> e este script no <head>
 *    (o script precisa rodar antes do corpo da página para bloquear o acesso sem login).
 */
(function () {
  'use strict';

  var CHAVE_SESSAO = 'sge_sessao';
  var PAGINA_INICIAL = 'inicio.html';

  // Usuários fictícios para demonstração.
  var USUARIOS = {
    aluno: [
      { matricula: '20260101', senha: 'aluno123', nome: 'Beatriz Oliveira' },
      { matricula: '20260102', senha: 'aluno456', nome: 'Gabriel Santos' }
    ],
    professor: [
      { matricula: '1001', senha: 'prof123', nome: 'Carlos Almeida' },
      { matricula: '1002', senha: 'prof456', nome: 'Marina Souza' }
    ]
  };

  // ---------- sessão ----------

  function lerSessao() {
    try {
      var texto = sessionStorage.getItem(CHAVE_SESSAO);
      return texto ? JSON.parse(texto) : null;
    } catch (e) {
      return null;
    }
  }

  function salvarSessao(sessao) {
    try {
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
      return true;
    } catch (e) {
      return false;
    }
  }

  function encerrarSessao() {
    try {
      sessionStorage.removeItem(CHAVE_SESSAO);
    } catch (e) { /* sem armazenamento: nada a limpar */ }
  }

  // Caminho da página inicial a partir da página atual (inicio.html ou pags/*.html).
  function urlInicio() {
    return /\/pags\/[^/]*$/.test(location.pathname)
      ? '../' + PAGINA_INICIAL
      : PAGINA_INICIAL;
  }

  // ---------- proteção das páginas internas ----------

  var perfilExigido = document.documentElement.getAttribute('data-perfil');

  function verificarAcesso() {
    var sessao = lerSessao();
    if (!sessao || sessao.perfil !== perfilExigido) {
      location.replace(urlInicio());
      return false;
    }
    return true;
  }

  if (perfilExigido) {
    // Roda já no <head>, antes de desenhar a página.
    verificarAcesso();
    // Voltar pelo histórico pode reaproveitar a página em cache depois do logout.
    window.addEventListener('pageshow', function (evento) {
      if (evento.persisted) { verificarAcesso(); }
    });
  }

  // ---------- login ----------

  function configurarLogin(form) {
    var perfil = form.getAttribute('data-login');
    var destino = form.getAttribute('data-destino');
    var campoMatricula = form.elements.matricula;
    var campoSenha = form.elements.senha;

    var erro = document.createElement('p');
    erro.className = 'erro';
    erro.setAttribute('role', 'alert');
    form.insertBefore(erro, form.querySelector('button[type="submit"]'));

    function mostrarErro(mensagem, campo) {
      erro.textContent = mensagem;
      if (campo) { campo.focus(); }
    }

    function limparErro() {
      erro.textContent = '';
    }

    // Validação de formato, antes de consultar as credenciais.
    function validarFormato(matricula, senha) {
      if (campoMatricula.validity && campoMatricula.validity.badInput) {
        return { mensagem: 'A matrícula deve conter apenas números.', campo: campoMatricula };
      }
      if (matricula === '') {
        return { mensagem: 'Informe a matrícula.', campo: campoMatricula };
      }
      if (!/^\d+$/.test(matricula)) {
        return { mensagem: 'A matrícula deve conter apenas números.', campo: campoMatricula };
      }
      if (senha === '') {
        return { mensagem: 'Informe a senha.', campo: campoSenha };
      }
      if (senha.length < 4) {
        return { mensagem: 'A senha deve ter pelo menos 4 caracteres.', campo: campoSenha };
      }
      return null;
    }

    function buscarUsuario(matricula, senha) {
      var lista = USUARIOS[perfil] || [];
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].matricula === matricula && lista[i].senha === senha) {
          return lista[i];
        }
      }
      return null;
    }

    // Evento submit: valida e só então segue para o menu.
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      limparErro();

      var matricula = campoMatricula.value.trim();
      var senha = campoSenha.value;

      var problema = validarFormato(matricula, senha);
      if (problema) {
        mostrarErro(problema.mensagem, problema.campo);
        return;
      }

      var usuario = buscarUsuario(matricula, senha);
      if (!usuario) {
        // Mensagem única de propósito: não revela se foi a matrícula ou a senha.
        campoSenha.value = '';
        mostrarErro('Matrícula ou senha incorretos.', campoSenha);
        return;
      }

      var salvou = salvarSessao({
        perfil: perfil,
        matricula: usuario.matricula,
        nome: usuario.nome
      });
      if (!salvou) {
        mostrarErro('Não foi possível iniciar a sessão. Verifique se o navegador permite armazenamento.');
        return;
      }
      location.href = destino;
    });

    // Evento input: some com a mensagem assim que a pessoa volta a digitar.
    form.addEventListener('input', limparErro);
  }

  // ---------- inicialização ----------

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form[data-login]');
    if (form) { configurarLogin(form); }

    // Evento click no "Sair": encerra a sessão e deixa o link navegar normalmente.
    var sair = document.querySelectorAll('.botao-sair');
    for (var i = 0; i < sair.length; i++) {
      sair[i].addEventListener('click', encerrarSessao);
    }

    // Saudação com o nome de quem entrou (se a página tiver o elemento).
    var saudacao = document.getElementById('saudacao');
    var sessao = lerSessao();
    if (saudacao && sessao) {
      saudacao.textContent = 'Olá, ' + sessao.nome + ' (matrícula ' + sessao.matricula + ')';
    }
  });
})();
