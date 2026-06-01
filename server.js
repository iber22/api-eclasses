const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let usuarios = [
    { id: 1, nome: "João Silva", email: "joao@email.com", idade: 28, nickname: "J0aoG4mer" },
    { id: 2, nome: "Maria Oliveira", email: "maria@email.com", idade: 35, nickname: "M4riaFPS" },
    { id: 3, nome: "Pedro Santos", email: "pedro@email.com", idade: 22, nickname: "Pedr0S4nt0s" }
];

let times = [
    { id: 1, name: "Cyber Dragons", color: "#7B1FA2" },
    { id: 2, name: "Neon Knights", color: "#00BCD4" }
];

let jogos = [
    { id: 1, name: "League of Legends", genre: "MOBA" },
    { id: 2, name: "VALORANT", genre: "FPS" },
    { id: 3, name: "Counter-Strike 2", genre: "FPS" },
    { id: 4, name: "Rocket League", genre: "Esport" }
];

let competidores = [
    { id: 1, name: "Pedro Santos", nickname: "Pterodactyl", teamId: 1 },
    { id: 2, name: "Julia Lima", nickname: "JuliaX", teamId: 1 },
    { id: 3, name: "Carlos Eduardo", nickname: "Cadu00", teamId: 2 },
    { id: 4, name: "Ana Oliveira", nickname: "AnaPvP", teamId: 2 }
];

let confrontos = [
    { id: 1, gameId: 1, team1Id: 1, team2Id: 2, score1: 1, score2: 0, status: "finished", date: "2026-03-24T14:00" },
    { id: 2, gameId: 2, team1Id: 2, team2Id: 1, score1: 0, score2: 0, status: "scheduled", date: "2026-03-25T16:00" }
];

// ====================== ROTAS ======================

app.get('/', (req, res) => {
    res.send(`Bem Vindo a API e-classes! Existem ${usuarios.length} usuarios cadastrados.`);
});

// USUÁRIOS
app.get('/usuarios', (req, res) => res.json(usuarios));
app.get('/usuarios/nome/:nome', (req, res) => {
    const termo = req.params.nome.toLowerCase();
    const resultados = usuarios.filter(u => 
        u.nome.toLowerCase().includes(termo) || 
        (u.nickname && u.nickname.toLowerCase().includes(termo))
    );
    res.json(resultados);
});
app.post('/usuarios', (req, res) => {
    const { nome, email, idade, nickname } = req.body;
    if (!nome || !email) return res.status(400).json({ mensagem: "Nome e email são obrigatórios." });
    const novo = { id: usuarios.length + 1, nome, email, idade: idade ? Number(idade) : null, nickname: nickname || null };
    usuarios.push(novo);
    res.status(201).json(novo);
});
app.put('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    const { nome, email, idade, nickname } = req.body;
    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (idade !== undefined) usuario.idade = idade ? Number(idade) : null;
    if (nickname !== undefined) usuario.nickname = nickname;
    res.json({ mensagem: "Usuário atualizado com sucesso.", usuario });
});
app.delete('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    const deletado = usuarios.splice(index, 1);
    res.json({ mensagem: "Usuário deletado com sucesso.", usuario: deletado[0] });
});

// TIMES
app.get('/times', (req, res) => res.json(times));
app.get('/times/:id', (req, res) => {
    const time = times.find(t => t.id === parseInt(req.params.id));
    time ? res.json(time) : res.status(404).json({ mensagem: "Time não encontrado." });
});
app.get('/times/busca/:termo', (req, res) => {
    const termo = req.params.termo.toLowerCase();
    const resultados = times.filter(t => t.name.toLowerCase().includes(termo));
    res.json(resultados);
});
app.post('/times', (req, res) => {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ mensagem: "Nome do time é obrigatório." });
    const novo = { id: times.length + 1, name, color: color || "#6366f1" };
    times.push(novo);
    res.status(201).json(novo);
});
app.put('/times/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const time = times.find(t => t.id === id);
    if (!time) return res.status(404).json({ mensagem: "Time não encontrado." });
    const { name, color } = req.body;
    if (name) time.name = name;
    if (color) time.color = color;
    res.json({ mensagem: "Time atualizado.", time });
});
app.delete('/times/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = times.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ mensagem: "Time não encontrado." });
    const deletado = times.splice(index, 1);
    res.json({ mensagem: "Time deletado.", time: deletado[0] });
});

// JOGOS
app.get('/jogos', (req, res) => res.json(jogos));
app.get('/jogos/:id', (req, res) => {
    const jogo = jogos.find(j => j.id === parseInt(req.params.id));
    jogo ? res.json(jogo) : res.status(404).json({ mensagem: "Jogo não encontrado." });
});
app.get('/jogos/busca/:termo', (req, res) => {
    const termo = req.params.termo.toLowerCase();
    const resultados = jogos.filter(j => j.name.toLowerCase().includes(termo));
    res.json(resultados);
});
app.post('/jogos', (req, res) => {
    const { name, genre } = req.body;
    if (!name) return res.status(400).json({ mensagem: "Nome do jogo é obrigatório." });
    const novo = { id: jogos.length + 1, name, genre: genre || "Outro" };
    jogos.push(novo);
    res.status(201).json(novo);
});
app.put('/jogos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const jogo = jogos.find(j => j.id === id);
    if (!jogo) return res.status(404).json({ mensagem: "Jogo não encontrado." });
    const { name, genre } = req.body;
    if (name) jogo.name = name;
    if (genre) jogo.genre = genre;
    res.json({ mensagem: "Jogo atualizado.", jogo });
});
app.delete('/jogos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = jogos.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ mensagem: "Jogo não encontrado." });
    const deletado = jogos.splice(index, 1);
    res.json({ mensagem: "Jogo deletado.", jogo: deletado[0] });
});

// COMPETIDORES
app.get('/competidores', (req, res) => res.json(competidores));
app.get('/competidores/:id', (req, res) => {
    const competidor = competidores.find(c => c.id === parseInt(req.params.id));
    competidor ? res.json(competidor) : res.status(404).json({ mensagem: "Competidor não encontrado." });
});
app.get('/competidores/busca/:termo', (req, res) => {
    const termo = req.params.termo.toLowerCase();
    const resultados = competidores.filter(c => 
        c.name.toLowerCase().includes(termo) || 
        c.nickname.toLowerCase().includes(termo)
    );
    res.json(resultados);
});
app.post('/competidores', (req, res) => {
    const { name, nickname, teamId } = req.body;
    if (!name || !nickname) return res.status(400).json({ mensagem: "Nome e nickname são obrigatórios." });
    const novo = { id: competidores.length + 1, name, nickname, teamId: Number(teamId) };
    competidores.push(novo);
    res.status(201).json(novo);
});
app.put('/competidores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const competidor = competidores.find(c => c.id === id);
    if (!competidor) return res.status(404).json({ mensagem: "Competidor não encontrado." });
    const { name, nickname, teamId } = req.body;
    if (name) competidor.name = name;
    if (nickname) competidor.nickname = nickname;
    if (teamId) competidor.teamId = Number(teamId);
    res.json({ mensagem: "Competidor atualizado.", competidor });
});
app.delete('/competidores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = competidores.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ mensagem: "Competidor não encontrado." });
    const deletado = competidores.splice(index, 1);
    res.json({ mensagem: "Competidor deletado.", competidor: deletado[0] });
});

// CONFRONTOS
app.get('/confrontos', (req, res) => res.json(confrontos));
app.get('/confrontos/pendentes', (req, res) => {
    const pendentes = confrontos.filter(c => c.status === "scheduled");
    res.json(pendentes);
});
app.get('/confrontos/finalizados', (req, res) => {
    const finalizados = confrontos.filter(c => c.status === "finished");
    res.json(finalizados);
});
app.post('/confrontos', (req, res) => {
    const { gameId, team1Id, team2Id, date } = req.body;
    if (!gameId || !team1Id || !team2Id) return res.status(400).json({ mensagem: "gameId, team1Id e team2Id são obrigatórios." });
    const novo = {
        id: confrontos.length + 1,
        gameId: Number(gameId),
        team1Id: Number(team1Id),
        team2Id: Number(team2Id),
        score1: 0,
        score2: 0,
        status: "scheduled",
        date: date || new Date().toISOString()
    };
    confrontos.push(novo);
    res.status(201).json(novo);
});
app.put('/confrontos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const confronto = confrontos.find(c => c.id === id);
    if (!confronto) return res.status(404).json({ mensagem: "Confronto não encontrado." });
    const { score1, score2, status, date } = req.body;
    if (score1 !== undefined) confronto.score1 = Number(score1);
    if (score2 !== undefined) confronto.score2 = Number(score2);
    if (status) confronto.status = status;
    if (date) confronto.date = date;
    res.json({ mensagem: "Confronto atualizado.", confronto });
});
app.delete('/confrontos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = confrontos.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ mensagem: "Confronto não encontrado." });
    const deletado = confrontos.splice(index, 1);
    res.json({ mensagem: "Confronto deletado.", confronto: deletado[0] });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});