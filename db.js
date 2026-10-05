// Conexão com o Supabase (usada somente no servidor).
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variáveis SUPABASE_URL e SUPABASE_KEY não configuradas.');
    console.error('   Copie .env.example para .env e preencha com os dados do seu projeto.');
    process.exit(1);
}

// A API é stateless: não precisamos de sessão de usuário do Supabase Auth.
// Node 22+ já tem WebSocket nativo. No Node 20 ou menor, o cliente do Supabase
// exige uma implementação para iniciar (mesmo sem usarmos tempo real), então
// usamos o pacote "ws". Recomendado: atualizar para o Node 22.
const opcoesRealtime = typeof WebSocket === 'undefined'
    ? { realtime: { transport: require('ws') } }
    : {};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...opcoesRealtime,
});

module.exports = supabase;
