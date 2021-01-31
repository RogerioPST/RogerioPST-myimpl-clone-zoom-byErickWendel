# MyImpl-Semana-javascript-expert02

Semana criada por Erick Wendel e que eu adicionei uns comentarios, mudei nome de variaveis, funções etc

- [Final](./final)

-passos para usar heroku:
1. criar conta 
2. 'npm i -g heroku'
3. atentar p usar as variaveis $PORT atribuidas nos package.json jah q o heroku usa e por padrao, o heroku roda o 'npm start'
4. cmd 'heroku login'
5. plano free tem até cinco aplicações (verificar)
6. cada projeto precisa ficar separado com o seu 'git init'
7. cmd: 'heroku apps:create nome_projeto'
8. fazer 'git add .', 'git commit -m', 'git push heroku master'
9. usar o endereço gerado p cada projeto chamar a aplicação
10. cmd 'heroku logs' p ver os logs, ver se subiu
11. assim q terminar de usar o heroku, deletar entrando em cada uma das pastas 'public', 'server', 'peer-server' rodando o cmd 'heroku apps:delete' e digitando o nome da aplicacao q aparecer.
12. rodar o cmd 'rm -rf .git' p subir p portfolio depois..