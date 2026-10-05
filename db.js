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
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
