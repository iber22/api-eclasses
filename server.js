const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Lê o arquivo de dados
async function lerDados() {
    try {
        const caminho = path.join(__dirname, 'data.json');
        const conteudo = await fs.promises.readFile(caminho, 'utf-8');
        return JSON.parse(conteudo);
    } catch (error) {
        console.error('Erro ao ler data.json:', error);
        throw new Error('Não foi possível carregar os dados do servidor');
    }
}

const successResponse = (res, data, status = 200) => {
    return res.status(status).json({
        status: 'sucesso',
        data
    });
};

const errorResponse = (res, message, status = 500, errorCode = null) => {
    const response = {
        status: 'erro',
        erro: message,
    };

    if (errorCode) {
        response.codigo = errorCode;
    }

    return res.status(status).json(response);
};

// GET / - boas vindas
app.get('/', (req, res) => {
    successResponse(res, {
        mensagem: 'Bem vindo à API GamerClass',
        rotas: ['/api/jogos', '/api/times', '/api/competidores', '/api/confrontos'],
    });
});

// GET /api/jogos - todos os jogos
app.get('/api/jogos', async (req, res, next) => {
    try {
        const { games } = await lerDados();
        successResponse(res, games);
    } catch (error) {
        next(error);
    }
});

// GET /api/jogos/:id - um jogo pelo id
app.get('/api/jogos/:id', async (req, res, next) => {
    try {
        const { games } = await lerDados();
        const jogo = games.find(j => j.id === Number(req.params.id));

        if (!jogo) {
            return errorResponse(res, 'Jogo não encontrado', 404, 'JOGO_NAO_ENCONTRADO');
        }

        successResponse(res, jogo);
    } catch (error) {
        next(error);
    }
});

// GET /api/times - todos os times
app.get('/api/times', async (req, res, next) => {
    try {
        const { teams } = await lerDados();
        successResponse(res, teams);
    } catch (error) {
        next(error);
    }
});

// GET /api/times/:id - um time pelo id
app.get('/api/times/:id', async (req, res, next) => {
    try {
        const { teams } = await lerDados();
        const time = teams.find(t => t.id === Number(req.params.id));

        if (!time) {
            return errorResponse(res, 'Time não encontrado', 404, 'TIME_NAO_ENCONTRADO');
        }

        successResponse(res, time);
    } catch (error) {
        next(error);
    }
});

// GET /api/competidores - todos os competidores
app.get('/api/competidores', async (req, res, next) => {
    try {
        const { competitors } = await lerDados();
        successResponse(res, competitors);
    } catch (error) {
        next(error);
    }
});

// GET /api/competidores/:id - um competidor pelo id
app.get('/api/competidores/:id', async (req, res, next) => {
    try {
        const { competitors } = await lerDados();
        const competidor = competitors.find(c => c.id === Number(req.params.id));

        if (!competidor) {
            return errorResponse(res, 'Competidor não encontrado', 404, 'COMPETIDOR_NAO_ENCONTRADO');
        }

        successResponse(res, competidor);
    } catch (error) {
        next(error);
    }
});

// GET /api/confrontos - todos os confrontos
app.get('/api/confrontos', async (req, res, next) => {
    try {
        const { matches } = await lerDados();
        successResponse(res, matches);
    } catch (error) {
        next(error);
    }
});

// GET /api/confrontos/:id - um confronto pelo id
app.get('/api/confrontos/:id', async (req, res, next) => {
    try {
        const { matches } = await lerDados();
        const confronto = matches.find(m => m.id === Number(req.params.id));

        if (!confronto) {
            return errorResponse(res, 'Confronto não encontrado', 404, 'CONFRONTO_NAO_ENCONTRADO');
        }

        successResponse(res, confronto);
    } catch (error) {
        next(error);
    }
});

// Rota não encontrada
app.use((req, res) => {
    errorResponse(res, 'Rota não encontrada', 404, 'ROTA_NAO_ENCONTRADA');
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    errorResponse(res, 'Erro interno do servidor', 500, 'ERRO_INTERNO');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
});