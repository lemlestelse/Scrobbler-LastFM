const express = require('express');
const fs = require('fs').promises;
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
const RPC = require('discord-rpc');

dotenv.config();

const app = express();
const PORT = 3000;

let contadorScrobbles = 0;
let tempoAbertura = 0;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const clientId = '1292153568698040370'; // Seu Client ID
const rpc = new RPC.Client({ transport: 'ipc' });

let faixaAtual = 'Pronto para scrobbles';
let artistaAtual = 'Aguardando...';

// Função para gerar uma cor aleatória
const gerarCorAleatoria = () => {
  return '#' + Array.from({ length: 6 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
};

// Função para imprimir mensagens com cores aleatórias
const logComCorAleatoria = (mensagem) => {
  const cor = gerarCorAleatoria();
  const rgb = [...cor.slice(1).match(/.{2}/g)].map(hex => parseInt(hex, 16)).join(';');
  console.log(`\x1b[38;2;${rgb}m${mensagem}\x1b[0m`);
};

// Configuração do Discord Rich Presence
const atualizarRichPresence = () => {
  rpc.setActivity({
    details: `Escutando: ${faixaAtual}`,
    state: `Artista: ${artistaAtual} | Scrobbles: ${contadorScrobbles}`,
    largeImageKey: 'icon',
    largeImageText: 'Scrobbler by Neurasthenia',
    startTimestamp: Math.floor(Date.now() / 1000) - tempoAbertura,
    buttons: [
      { label: 'Spotify', url: 'https://open.spotify.com/intl-pt/artist/7BkNhKE6AKGSutvIyPvH37?si=6S5LBSO1TcinKn-4R4g0FQ' },
      { label: 'Instagram', url: 'https://www.instagram.com/neurastheniaband/' }
    ]
  });
};

// Debounce para atualização do Rich Presence
let lastUpdate = 0;
const updateDelay = 5000;

const atualizarRichPresenceDebounce = (faixa, artista) => {
  faixaAtual = faixa;
  artistaAtual = artista;
  const now = Date.now();
  if (now - lastUpdate > updateDelay) {
    atualizarRichPresence();
    lastUpdate = now;
  }
};

// Conectar ao Discord
rpc.on('ready', () => {
  console.log('🔗 Discord Rich Presence conectado!');
  atualizarRichPresence();
});

rpc.login({ clientId }).catch(err => {
  console.error('❌ Erro ao conectar ao Discord:', err);
});

// Função para gerar a assinatura da API
const gerarAssinaturaApi = (params) => {
  const chaves = Object.keys(params).sort();
  let sig = '';
  chaves.forEach(chave => {
    sig += `${chave}${params[chave]}`;
  });
  sig += process.env.SECRET;
  return crypto.createHash('md5').update(sig).digest('hex');
};

// Função para obter a chave de sessão
const obterChaveSessao = async () => {
  const params = {
    method: 'auth.getMobileSession',
    username: process.env.LOGIN,
    password: process.env.PASSWORD,
    api_key: process.env.API_KEY,
  };
  
  // Gerar a assinatura após a criação de 'params'
  params.api_sig = gerarAssinaturaApi(params);
  params.format = 'json';

  try {
    const { data } = await axios.post('https://ws.audioscrobbler.com/2.0/', null, { params });
    console.log(colors.green + '🔐 Autenticação realizada com sucesso!' + colors.reset);
    return data.session.key;
  } catch (error) {
    console.error(colors.red + '❌ Falha na autenticação:', error.response ? error.response.data : error + colors.reset);
    throw error;
  }
};

// Função para scrobblar uma faixa
const scrobbleFaixa = async (chaveSessao, faixa, artista, album, timestamp) => {
  const params = {
    method: 'track.scrobble',
    artist: artista,
    track: faixa,
    album: album,
    timestamp: timestamp,
    api_key: process.env.API_KEY,
    sk: chaveSessao,
  };
  
  // Gerar a assinatura após a criação de 'params'
  params.api_sig = gerarAssinaturaApi(params);
  params.format = 'json';

  try {
    const { data } = await axios.post('https://ws.audioscrobbler.com/2.0/', null, { params });
    contadorScrobbles++;
    const logMessage = `🎶 Scrobble realizado: "${faixa}" por ${artista} em ${new Date(timestamp * 1000).toLocaleString()}. Total de scrobbles: ${contadorScrobbles}`;
    await fs.appendFile('log.txt', logMessage + '\n');
    logComCorAleatoria(logMessage);
    atualizarRichPresenceDebounce(faixa, artista);
    return data.scrobbles;
  } catch (error) {
    console.error(colors.red + `⚠️ Erro ao scrobbler: "${faixa}" por ${artista}"`, error.response ? error.response.data : error + colors.reset);
    throw error;
  }
};

// Função para obter o delay baseado no modo
const obterDelayModo = () => {
  const delayMap = {
    'TURBO': 500,
    'SLOW': 60000,
    'FAST': 5000
  };
  return delayMap[process.env.MODE] || 5000;
};

// Função para gerar timestamps aleatórios
const gerarTimestampAleatorio = () => {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() - Math.floor(Math.random() * 7));
  hoje.setHours(hoje.getHours() - Math.floor(Math.random() * 24));
  hoje.setMinutes(hoje.getMinutes() - Math.floor(Math.random() * 60));
  return Math.floor(hoje.getTime() / 1000);
};

// Função para atualizar o tempo de abertura
const atualizarTempoAbertura = () => {
  setInterval(() => {
    tempoAbertura++;
    atualizarRichPresence();
  }, 1000);
};

// Função principal para scrobbler faixas continuamente
const scrobblerFaixas = async () => {
  try {
    const chaveSessao = await obterChaveSessao();
    const faixas = JSON.parse(await fs.readFile('tracks.json', 'utf8'));
    const delay = obterDelayModo();

    while (true) {
      const faixasEmbaralhadas = [...faixas];
      while (faixasEmbaralhadas.length) {
        const indiceAleatorio = Math.floor(Math.random() * faixasEmbaralhadas.length);
        const { track, artist, album } = faixasEmbaralhadas.splice(indiceAleatorio, 1)[0];
        const timestamp = gerarTimestampAleatorio();
        await scrobbleFaixa(chaveSessao, track, artist, album, timestamp);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } catch (err) {
    console.error(colors.red + '❌ Falha na autenticação ou no scrobbler:', err + colors.reset);
  }
};

// Função para iniciar o scrobbler ao pressionar Enter
const iniciarScrobbler = () => {
  console.clear();
  process.title = 'Scrobbler | Neurasthenia';
  console.log(colors.blue + '🔔 Pressione Enter para iniciar o scrobbler...' + colors.reset);
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.once('data', async () => {
    process.stdin.setRawMode(false);
    console.log(colors.green + '🔄 Iniciando o scrobbler...' + colors.reset);
    atualizarTempoAbertura();
    await scrobblerFaixas();
  });
};

// Iniciar o servidor e o prompt de comando
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Iniciar o scrobbler
iniciarScrobbler();
