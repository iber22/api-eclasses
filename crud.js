// Fábrica de rotas CRUD: recebe a definição de um recurso (ver resources.js)
// e devolve um Router com GET (lista e por id), POST, PUT e DELETE.

const express = require('express');
const supabase = require('./db');
const { successResponse, ApiError } = require('./http');

// Converte o :id da URL em número. Rejeita "abc", "1.5", "-3", "0" etc.
function lerId(valor) {
    if (!/^\d+$/.test(valor)) {
        throw new ApiError(400, 'ID inválido: use um número inteiro positivo', 'ID_INVALIDO');
    }
    const id = Number(valor);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw new ApiError(400, 'ID inválido: use um número inteiro positivo', 'ID_INVALIDO');
    }
    return id;
}

// O body precisa ser um objeto JSON ({ ... }).
function lerBody(req) {
    const body = req.body;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
        throw new ApiError(400, 'Envie um objeto JSON no corpo da requisição', 'CORPO_INVALIDO');
    }
    return body;
}

// Valida o body com as regras do recurso; lança 400 com a lista de problemas.
function validarOuFalhar(recurso, body, criacao) {
    const { dados, erros } = recurso.validar(body, criacao);
    if (erros.length) {
        throw new ApiError(400, 'Dados inválidos', 'DADOS_INVALIDOS', erros);
    }
    return dados;
}

// Traduz os erros do Postgres (via Supabase) para respostas HTTP amigáveis.
// Erros desconhecidos são relançados e viram 500 no middleware global.
function tratarErroBanco(error, recurso, operacao) {
    switch (error.code) {
        case '23505': // unique_violation
            throw new ApiError(409, recurso.msgDuplicado || 'Registro duplicado', 'REGISTRO_DUPLICADO');

        case '23503': // foreign_key_violation
            if (operacao === 'excluir') {
                throw new ApiError(
                    409,
                    recurso.msgEmUso || `Não é possível excluir: ${recurso.rotulo} está em uso`,
                    'REGISTRO_EM_USO'
                );
            }
            throw new ApiError(400, recurso.msgRefInvalida || 'Referência inválida', 'REFERENCIA_INVALIDA');

        case '23514': // check_violation
        case '23502': // not_null_violation
        case '22P02': // invalid_text_representation
        case '22003': // numeric_value_out_of_range
            throw new ApiError(400, 'Dados inválidos', 'DADOS_INVALIDOS');

        default: {
            const e = new Error(`Erro no banco (${operacao} em ${recurso.tabela}): ${error.message}`);
            e.causa = error;
            throw e;
        }
    }
}

function criarRouter(recurso) {
    const router = express.Router();
    const naoEncontrado = () =>
        new ApiError(404, `${recurso.rotulo} não encontrado`, recurso.codigoNaoEncontrado);

    // GET /api/<rota> — lista
    router.get('/', async (req, res) => {
        const { data, error } = await supabase.from(recurso.tabela).select('*').order('id');
        if (error) tratarErroBanco(error, recurso, 'listar');

        successResponse(res, data.map(recurso.paraApi));
    });

    // GET /api/<rota>/:id — um registro
    router.get('/:id', async (req, res) => {
        const id = lerId(req.params.id);

        const { data, error } = await supabase
            .from(recurso.tabela)
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) tratarErroBanco(error, recurso, 'buscar');
        if (!data) throw naoEncontrado();

        successResponse(res, recurso.paraApi(data));
    });

    // POST /api/<rota> — cria (201)
    router.post('/', async (req, res) => {
        const dados = validarOuFalhar(recurso, lerBody(req), true);

        const { data, error } = await supabase
            .from(recurso.tabela)
            .insert(dados)
            .select()
            .single();
        if (error) tratarErroBanco(error, recurso, 'criar');

        successResponse(res, recurso.paraApi(data), 201);
    });

    // PUT /api/<rota>/:id — atualiza (substituição completa)
    router.put('/:id', async (req, res) => {
        const id = lerId(req.params.id);
        const dados = validarOuFalhar(recurso, lerBody(req), false);

        const { data, error } = await supabase
            .from(recurso.tabela)
            .update(dados)
            .eq('id', id)
            .select()
            .maybeSingle();
        if (error) tratarErroBanco(error, recurso, 'atualizar');
        if (!data) throw naoEncontrado();

        successResponse(res, recurso.paraApi(data));
    });

    // DELETE /api/<rota>/:id — exclui e devolve o registro removido
    router.delete('/:id', async (req, res) => {
        const id = lerId(req.params.id);

        const { data, error } = await supabase
            .from(recurso.tabela)
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle();
        if (error) tratarErroBanco(error, recurso, 'excluir');
        if (!data) throw naoEncontrado();

        successResponse(res, recurso.paraApi(data));
    });

    return router;
}

module.exports = criarRouter;
