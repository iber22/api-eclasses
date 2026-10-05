// Funções pequenas de validação. Cada uma lê um campo do body, adiciona uma
// mensagem em `erros` se algo estiver errado e devolve o valor já normalizado.

const ID_MAX = Number.MAX_SAFE_INTEGER;

function texto(body, campo, erros, { max = 100 } = {}) {
    const valor = body[campo];

    if (typeof valor !== 'string' || valor.trim() === '') {
        erros.push(`${campo} é obrigatório (texto não vazio)`);
        return undefined;
    }

    const limpo = valor.trim();
    if (limpo.length > max) {
        erros.push(`${campo} deve ter no máximo ${max} caracteres`);
        return undefined;
    }
    return limpo;
}

// Aceita número ou string numérica ("3"). Se `padrao` for informado, o campo
// pode ser omitido. Se `anulavel` for true, aceita null / "".
function inteiro(body, campo, erros, { min = 0, max = 2147483647, padrao, anulavel = false } = {}) {
    const valor = body[campo];

    if (valor === undefined) {
        if (padrao !== undefined) return padrao;
        erros.push(`${campo} é obrigatório`);
        return undefined;
    }

    if (valor === null || valor === '') {
        if (anulavel) return null;
        erros.push(`${campo} é obrigatório`);
        return undefined;
    }

    let numero = NaN;
    if (typeof valor === 'number') numero = valor;
    else if (typeof valor === 'string' && /^-?\d+$/.test(valor.trim())) numero = Number(valor);

    if (!Number.isInteger(numero) || numero < min || numero > max) {
        erros.push(`${campo} deve ser um número inteiro entre ${min} e ${max}`);
        return undefined;
    }
    return numero;
}

function opcao(body, campo, erros, validos, { padrao } = {}) {
    const valor = body[campo];

    if (valor === undefined && padrao !== undefined) return padrao;

    if (!validos.includes(valor)) {
        erros.push(`${campo} deve ser um destes valores: ${validos.join(', ')}`);
        return undefined;
    }
    return valor;
}

// Cor no formato #RRGGBB
function cor(body, campo, erros, { padrao } = {}) {
    const valor = body[campo];

    if (valor === undefined && padrao !== undefined) return padrao;

    if (typeof valor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(valor.trim())) {
        erros.push(`${campo} deve ser uma cor no formato #RRGGBB`);
        return undefined;
    }
    return valor.trim().toLowerCase();
}

// Data/hora. Devolve ISO 8601 em UTC. Para evitar ambiguidade de fuso,
// o ideal é o cliente enviar com fuso (ex.: 2026-03-24T14:00:00-03:00).
function dataHora(body, campo, erros) {
    const valor = body[campo];

    if (typeof valor !== 'string' || valor.trim() === '') {
        erros.push(`${campo} é obrigatório (data e hora)`);
        return undefined;
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
        erros.push(`${campo} não é uma data/hora válida`);
        return undefined;
    }
    return data.toISOString();
}

module.exports = { ID_MAX, texto, inteiro, opcao, cor, dataHora };
