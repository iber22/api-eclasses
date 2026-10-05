const express = require('express');
const cors = require('cors');

const recursos = require('./resources');
const criarRouter = require('./crud');
const { successResponse, errorResponse, ApiError } = require('./http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// GET / - boas vindas
app.get('/', (req, res) => {
    successResponse(res, {
        mensagem: 'Bem vindo à API GamerClass',
        rotas: recursos.map((r) => `/api/${r.rota}`),
        metodos: {
            'GET /api/<rota>': 'lista todos',
            'GET /api/<rota>/:id': 'busca um',
            'POST /api/<rota>': 'cria',
            'PUT /api/<rota>/:id': 'atualiza',
            'DELETE /api/<rota>/:id': 'exclui',
        },
    });
});

// /api/jogos, /api/times, /api/competidores, /api/confrontos
for (const recurso of recursos) {
    app.use(`/api/${recurso.rota}`, criarRouter(recurso));
}

// Rota não encontrada
app.use((req, res) => {
    errorResponse(res, 'Rota não encontrada', 404, 'ROTA_NAO_ENCONTRADA');
});

// Middleware global de tratamento de erros
// (precisa ter 4 parâmetros para o Express reconhecê-lo como handler de erro)
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return errorResponse(res, err.message, err.status, err.codigo, err.detalhes);
    }

    // JSON malformado no corpo da requisição
    if (err.type === 'entity.parse.failed') {
        return errorResponse(res, 'JSON inválido no corpo da requisição', 400, 'JSON_INVALIDO');
    }
    if (err.type === 'entity.too.large') {
        return errorResponse(res, 'Corpo da requisição muito grande', 413, 'CORPO_MUITO_GRANDE');
    }

    console.error('Erro não tratado:', err);
    errorResponse(res, 'Erro interno do servidor', 500, 'ERRO_INTERNO');
});

// Só inicia o servidor quando executado diretamente (node server.js).
// Assim os testes podem importar o `app` sem abrir a porta 3000.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📍 Acesse: http://localhost:${PORT}`);
    });
}

module.exports = app;
