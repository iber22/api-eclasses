// Formato padrão das respostas da API (o mesmo que já existia no projeto).

const successResponse = (res, data, status = 200) => {
    return res.status(status).json({
        status: 'sucesso',
        data,
    });
};

const errorResponse = (res, message, status = 500, errorCode = null, detalhes = null) => {
    const response = {
        status: 'erro',
        erro: message,
    };

    if (errorCode) response.codigo = errorCode;
    if (detalhes && detalhes.length) response.detalhes = detalhes;

    return res.status(status).json(response);
};

// Erro "esperado" (validação, não encontrado, conflito...). Lançado nas rotas
// e convertido em resposta pelo middleware global de erros.
class ApiError extends Error {
    constructor(status, message, codigo = null, detalhes = null) {
        super(message);
        this.status = status;
        this.codigo = codigo;
        this.detalhes = detalhes;
    }
}

module.exports = { successResponse, errorResponse, ApiError };
