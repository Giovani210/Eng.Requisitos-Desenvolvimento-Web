\- Código: CT01

\- Requisito: RF01

\- Objetivo: Verificar se o usuário consegue acessar o sistema com credenciais válidas.

\- Pré-condições: Usuário cadastrado no sistema.

\- Passos:

&#x20; 1. Acessar a tela de login.

&#x20; 2. Informar e-mail válido.

&#x20; 3. Informar senha correta.

&#x20; 4. Clicar em Entrar.

\- Dados de entrada:

&#x20; - E-mail: professor@escola.com

&#x20; - Senha: Escola123

\- Resultado esperado: O sistema deve autenticar o usuário e permitir acesso à página principal.

\- Resultado obtido: a pagína atualizou e liberou a opção "página principal" pro usuario.

\- Status: Executado.







CT02 – Teste negativo

\- Código: CT02

\- Requisito: RF01

\- Objetivo: Verificar se o sistema impede o acesso com senha incorreta.

\- Pré-condições: Usuário cadastrado.

\- Passos:

&#x20; 1. Acessar a tela de login.

&#x20; 2. Informar e-mail válido.

&#x20; 3. Informar senha incorreta.

&#x20; 4. Clicar em Entrar.

\- Dados de entrada:

&#x20; - E-mail: professor@escola.com

&#x20; - Senha: senhaerrada

\- Resultado esperado: O sistema deve negar o acesso e apresentar mensagem de erro.

\- Resultado obtido: a mensagem " erro" foi exibida .

\- Status:  Executado.





RF02 – Cadastro de alunos

CT03 – Teste positivo

\- Código: CT03

\- Requisito: RF02

\- Objetivo: Verificar se o sistema permite cadastrar um aluno com dados válidos.

\- Pré-condições: Usuário autenticado e acesso ao cadastro de alunos.

\- Passos:

&#x20; 1. Acessar o menu de alunos.

&#x20; 2. Selecionar a opção cadastrar.

&#x20; 3. Preencher os campos obrigatórios.

&#x20; 4. Clicar em Salvar.

\- Dados de entrada:

&#x20; - Nome: Lucas Oliveira

&#x20; - Matrícula: 2026001

&#x20; - Turma: 1º A

&#x20; - Data de nascimento: 10/05/2010

\- Resultado esperado: O aluno deve ser cadastrado com sucesso e aparecer na lista de alunos.

\- Resultado obtido: a pagina atualizou e os dados foram salvos .

\- Status: Executado.







CT04 – Teste negativo

\- Código: CT04

\- Requisito: RF02

\- Objetivo: Verificar se o sistema impede o cadastro de alunos com campos obrigatórios vazios.

\- Pré-condições: Usuário autenticado.

\- Passos:

&#x20; 1. Acessar o cadastro de alunos.

&#x20; 2. Deixar o campo nome vazio.

&#x20; 3. Preencher os demais campos.

&#x20; 4. Clicar em Salvar.

\- Dados de entrada: 

&#x20; - Nome: vazio

&#x20; - Matrícula: 2026002

&#x20; - Turma: 1º A

\- Resultado esperado: O sistema deve impedir o cadastro e informar que o nome é obrigatório.

\- Resultado obtido: o sistema exibiu a mensagem "o nome do aluno deve ser exibido".

\- Status: Executado.



RF03 – Cadastro de notas e cálculo de médias





CT05 – Teste positivo

* Código: CT05

\- Requisito: RF03

\- Objetivo: Verificar se o sistema permite cadastrar notas válidas e calcular corretamente a média do aluno.

\- Pré-condições: Aluno cadastrado e usuário autenticado.

\- Passos:

&#x20; 1. Acessar o módulo de notas.

&#x20; 2. Selecionar o aluno.

&#x20; 3. Informar as três notas.

&#x20; 4. Salvar os dados.

&#x20; 5. Consultar a média calculada.

\- Dados de entrada:

&#x20; - Nota 1: 8,0

&#x20; - Nota 2: 7,0

&#x20; - Nota 3: 9,0

\- Resultado esperado: O sistema deve calcular a média 8,0 e apresentar o resultado corretamente.

\- Resultado obtido: O SISTEMA Exibiu a media = 8,0.

\- Status: Já Executado.





CT06 – Teste POSITIVO

\- Código: CT06

\- Requisito: RF03

\- Objetivo: Verificar se o sistema impede o registro de notas inválidas.

\- Pré-condições: Aluno cadastrado e usuário autenticado.

\- Passos:

&#x20; 1. Acessar o módulo de notas.

&#x20; 2. Selecionar o aluno.

&#x20; 3. Informar uma nota inválida.

&#x20; 4. Tentar salvar os dados.

\- Dados de entrada:

&#x20; - Nota 1: 12,0

&#x20; - Nota 2: 7,0

&#x20; - Nota 3: 9,0

\- Resultado esperado: O sistema deve impedir o registro da nota acima de 10 e apresentar uma mensagem de validação.

\- Resultado obtido: O SISTEMA EXIBIU A MENSAGEM "NOTA INVALIDÁ".

\- Status: JÁ Executado.

