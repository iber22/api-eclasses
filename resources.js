// Definição dos 4 recursos da API.
//
// Para cada recurso:
//   rota / tabela     -> URL (/api/<rota>) e tabela no Supabase
//   rotulo            -> nome usado nas mensagens de erro
//   paraApi(linha)    -> converte a linha do banco (snake_case) para o JSON da API (camelCase)
//   validar(body, criacao) -> valida o body e devolve { dados, erros }
//                            `dados` já no formato das colunas do banco
//   msg*              -> mensagens para erros de banco (duplicidade, referência etc.)
//
// POST  (criacao = true)  : campos com valor padrão podem ser omitidos.
// PUT   (criacao = false) : substituição completa, todos os campos são obrigatórios,
//                           assim um PUT incompleto nunca zera dados sem querer.

const { ID_MAX, texto, inteiro, opcao, cor, dataHora } = require('./validators');

const STATUS_VALIDOS = ['scheduled', 'finished'];

const jogos = {
    rota: 'jogos',
    tabela: 'games',
    rotulo: 'Jogo',
    codigoNaoEncontrado: 'JOGO_NAO_ENCONTRADO',
    msgDuplicado: 'Já existe um jogo com esse nome',
    msgEmUso: 'Não é possível excluir este jogo: ele possui confrontos cadastrados. Exclua os confrontos primeiro',

    paraApi: (l) => ({ id: l.id, name: l.name, genre: l.genre }),

    validar(body) {
        const erros = [];
        const dados = {
            name: texto(body, 'name', erros),
            genre: texto(body, 'genre', erros, { max: 50 }),
        };
        return { dados, erros };
    },
};

const times = {
    rota: 'times',
    tabela: 'teams',
    rotulo: 'Time',
    codigoNaoEncontrado: 'TIME_NAO_ENCONTRADO',
    msgDuplicado: 'Já existe um time com esse nome',
    msgEmUso: 'Não é possível excluir este time: ele possui confrontos cadastrados. Exclua os confrontos primeiro',

    paraApi: (l) => ({ id: l.id, name: l.name, color: l.color }),

    validar(body, criacao) {
        const erros = [];
        const dados = {
            name: texto(body, 'name', erros),
            color: cor(body, 'color', erros, { padrao: criacao ? '#6366f1' : undefined }),
        };
        return { dados, erros };
    },
};

const competidores = {
    rota: 'competidores',
    tabela: 'competitors',
    rotulo: 'Competidor',
    codigoNaoEncontrado: 'COMPETIDOR_NAO_ENCONTRADO',
    msgDuplicado: 'Já existe um competidor com esse nickname',
    msgRefInvalida: 'O time informado (teamId) não existe',

    paraApi: (l) => ({ id: l.id, name: l.name, nickname: l.nickname, teamId: l.team_id }),

    validar(body, criacao) {
        const erros = [];
        const dados = {
            name: texto(body, 'name', erros),
            nickname: texto(body, 'nickname', erros, { max: 50 }),
            // null = competidor sem time. No PUT a chave precisa vir no body.
            team_id: inteiro(body, 'teamId', erros, {
                min: 1,
                max: ID_MAX,
                anulavel: true,
                padrao: criacao ? null : undefined,
            }),
        };
        return { dados, erros };
    },
};

const confrontos = {
    rota: 'confrontos',
    tabela: 'matches',
    rotulo: 'Confronto',
    codigoNaoEncontrado: 'CONFRONTO_NAO_ENCONTRADO',
    msgRefInvalida: 'O jogo (gameId) ou um dos times (team1Id, team2Id) informados não existe',

    paraApi: (l) => ({
        id: l.id,
        gameId: l.game_id,
        team1Id: l.team1_id,
        team2Id: l.team2_id,
        score1: l.score1,
        score2: l.score2,
        status: l.status,
        date: l.match_date,
    }),

    validar(body, criacao) {
        const erros = [];
        const dados = {
            game_id: inteiro(body, 'gameId', erros, { min: 1, max: ID_MAX }),
            team1_id: inteiro(body, 'team1Id', erros, { min: 1, max: ID_MAX }),
            team2_id: inteiro(body, 'team2Id', erros, { min: 1, max: ID_MAX }),
            score1: inteiro(body, 'score1', erros, { min: 0, max: 999, padrao: criacao ? 0 : undefined }),
            score2: inteiro(body, 'score2', erros, { min: 0, max: 999, padrao: criacao ? 0 : undefined }),
            status: opcao(body, 'status', erros, STATUS_VALIDOS, { padrao: criacao ? 'scheduled' : undefined }),
            match_date: dataHora(body, 'date', erros),
        };

        if (dados.team1_id !== undefined && dados.team1_id === dados.team2_id) {
            erros.push('team1Id e team2Id devem ser times diferentes');
        }
        return { dados, erros };
    },
};

module.exports = [jogos, times, competidores, confrontos];
