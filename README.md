# API E-classes (GamerClass)

API REST do sistema de controle de competições de jogos online. Gerencia **jogos, times, competidores e confrontos**, com banco de dados real no **Supabase** (PostgreSQL).

- **Stack:** Node.js 22+ · Express 5 · `@supabase/supabase-js`
- **Front-end:** repositório `front-eclasses`

## 1. Criar o banco no Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com).
2. No menu lateral, abra **SQL Editor → New query**.
3. Cole o conteúdo de [`database/schema.sql`](database/schema.sql) e clique em **Run**.
   Isso cria as 4 tabelas, as regras de integridade e os dados iniciais. Pode ser executado mais de uma vez sem duplicar nada.
4. Em **Project Settings → API**, copie:
   - **Project URL**
   - a chave secreta **`service_role`** (nas contas novas pode aparecer como *secret key*).

> ⚠️ A chave `service_role` ignora todas as regras de segurança do banco. Use **somente** no servidor (arquivo `.env`) e **nunca** a coloque no front-end nem no GitHub. O `.env` já está no `.gitignore`.
>
> As tabelas têm RLS ligado e sem policies, então a chave pública (`anon`) **não** consegue ler nem gravar nada. Todo acesso passa por esta API.

## 2. Rodar a API

Requer **Node.js 22 ou superior** (exigência do `supabase-js`). Confira com `node -v`.

```bash
npm install
cp .env.example .env     # no Windows: copy .env.example .env
# edite o .env com SUPABASE_URL e SUPABASE_KEY
npm start                # ou: npm run dev (reinicia ao salvar)
```

A API sobe em `http://localhost:3000`.

## 3. Rotas

Todos os recursos seguem o mesmo padrão:

| Método | Rota | O que faz | Sucesso |
|---|---|---|---|
| GET | `/api/<recurso>` | lista todos | 200 |
| GET | `/api/<recurso>/:id` | busca um | 200 |
| POST | `/api/<recurso>` | cria | 201 |
| PUT | `/api/<recurso>/:id` | atualiza (substituição completa) | 200 |
| DELETE | `/api/<recurso>/:id` | exclui (devolve o registro removido) | 200 |

`<recurso>` = `jogos`, `times`, `competidores` ou `confrontos`.

### Corpo esperado (POST e PUT)

| Recurso | Campos |
|---|---|
| **jogos** | `name` (texto), `genre` (texto) |
| **times** | `name` (texto), `color` (`#RRGGBB`; no POST o padrão é `#6366f1`) |
| **competidores** | `name`, `nickname`, `teamId` (id de um time ou `null` = sem time) |
| **confrontos** | `gameId`, `team1Id`, `team2Id` (times diferentes), `date` (ISO 8601), `score1`, `score2` (0–999), `status` (`scheduled` ou `finished`) |

- No **POST** de confrontos, `score1`, `score2` e `status` podem ser omitidos (viram `0`, `0` e `scheduled`).
- No **PUT** todos os campos são obrigatórios. É de propósito: um PUT incompleto nunca zera dados sem querer.
- Envie `date` com fuso (ex.: `2026-03-24T14:00:00-03:00`) para evitar ambiguidade de horário.

### Exemplos

```bash
# criar um time
curl -X POST http://localhost:3000/api/times \
  -H "Content-Type: application/json" \
  -d '{"name":"Ninjas da Noite","color":"#ff8800"}'

# finalizar um confronto
curl -X PUT http://localhost:3000/api/confrontos/2 \
  -H "Content-Type: application/json" \
  -d '{"gameId":2,"team1Id":2,"team2Id":1,"score1":13,"score2":9,"status":"finished","date":"2026-03-25T16:00:00-03:00"}'

# excluir um competidor
curl -X DELETE http://localhost:3000/api/competidores/4
```

### Formato das respostas

```json
{ "status": "sucesso", "data": { "id": 3, "name": "Ninjas da Noite", "color": "#ff8800" } }
```
```json
{ "status": "erro", "erro": "Dados inválidos", "codigo": "DADOS_INVALIDOS",
  "detalhes": ["name é obrigatório (texto não vazio)"] }
```

| Status | Quando | `codigo` |
|---|---|---|
| 400 | dados inválidos, id inválido, JSON quebrado, jogo/time referenciado não existe | `DADOS_INVALIDOS`, `ID_INVALIDO`, `JSON_INVALIDO`, `CORPO_INVALIDO`, `REFERENCIA_INVALIDA` |
| 404 | registro ou rota não existe | `JOGO_NAO_ENCONTRADO`, `TIME_NAO_ENCONTRADO`, ... |
| 409 | nome duplicado, ou exclusão de jogo/time que ainda tem confrontos | `REGISTRO_DUPLICADO`, `REGISTRO_EM_USO` |
| 500 | erro interno (detalhes só no log do servidor) | `ERRO_INTERNO` |

### Regras de integridade (garantidas pelo banco)

- Nomes de jogos e times, e nicknames de competidores, são únicos (sem diferenciar maiúsculas/minúsculas).
- Um confronto não pode ter o mesmo time dos dois lados, nem placar negativo.
- **Excluir um time** deixa seus competidores "sem time" (não apaga os competidores).
- **Jogos e times com confrontos não podem ser excluídos** (a API responde 409). Exclua os confrontos antes.

## 4. Testes

```bash
npm test
```

Roda 8 testes de integração contra o banco configurado no `.env`: cobrem todos os métodos dos 4 recursos, validações e regras de integridade. Os testes criam registros com prefixo `TESTE_` e apagam tudo ao final, sem tocar nos dados iniciais. Também servem para confirmar que a conexão com o Supabase está correta.

## 5. Estrutura

```
server.js        inicialização, CORS, rota de boas-vindas, tratamento global de erros
crud.js          rotas GET / POST / PUT / DELETE, geradas para cada recurso
resources.js     definição dos 4 recursos: tabela, validação, conversão banco -> JSON
validators.js    funções de validação reutilizáveis
db.js            conexão com o Supabase
http.js          formato padrão das respostas e classe de erro
database/        schema.sql (tabelas + dados iniciais)
test/            testes de integração
```

As colunas do banco usam `snake_case` (`team_id`, `match_date`); a API converte para o `camelCase` que o front usa (`teamId`, `date`).

## 6. Publicar (opcional)

Em serviços como Render ou Railway, configure `SUPABASE_URL`, `SUPABASE_KEY` e `CORS_ORIGIN` (URL do seu front) como variáveis de ambiente, com o comando de start `npm start`. Depois, ajuste `BASE_URL` em `service/api.js` do front.
