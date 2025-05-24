const express = require('express');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config(); // Carrega variáveis do arquivo .env

const app = express();
const PORT = 3000;

let contadorScrobbles = 0;

// Cores para logs no terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Gera uma cor hexadecimal aleatória
const gerarCorAleatoria = () => {
  const letras = '0123456789ABCDEF';
  let cor = '#';
  for (let i = 0; i < 6; i++) {
    cor += letras[Math.floor(Math.random() * 16)];
  }
  return cor;
};

// Imprime mensagem colorida com cor RGB aleatória no terminal
const logComCorAleatoria = (mensagem) => {
  const cor = gerarCorAleatoria();
  console.log(
    `\x1b[38;2;${parseInt(cor.slice(1, 3), 16)};${parseInt(cor.slice(3, 5), 16)};${parseInt(
      cor.slice(5, 7),
      16
    )}m${mensagem}\x1b[0m`
  );
};

// Gera assinatura MD5 para autenticação na API
const gerarAssinaturaApi = (params) => {
  const chaves = Object.keys(params).sort();
  let sig = '';
  chaves.forEach((chave) => {
    sig += `${chave}${params[chave]}`;
  });
  sig += process.env.SECRET;
  return crypto.createHash('md5').update(sig).digest('hex');
};

// Realiza autenticação e retorna chave de sessão
const obterChaveSessao = async () => {
  const params = {
    method: 'auth.getMobileSession',
    username: process.env.LOGIN,
    password: process.env.PASSWORD,
    api_key: process.env.API_KEY,
  };
  params.api_sig = gerarAssinaturaApi(params);
  params.format = 'json';

  try {
    const response = await axios.post('https://ws.audioscrobbler.com/2.0/', null, { params });
    console.log(colors.green + '🔐 Autenticação realizada com sucesso!' + colors.reset);
    return response.data.session.key;
  } catch (error) {
    console.error(
      colors.red + '❌ Falha na autenticação:',
      error.response ? error.response.data : error + colors.reset
    );
    throw error.response ? error.response.data : error;
  }
};

// Scrobbla uma faixa na API do Last.fm
const scrobbleFaixa = async (chaveSessao, faixa, artista, album, timestamp) => {
  const params = {
    method: 'track.scrobble',
    artist: artista,
    track: faixa,
    album: album,
    timestamp,
    api_key: process.env.API_KEY,
    sk: chaveSessao,
  };
  params.api_sig = gerarAssinaturaApi(params);
  params.format = 'json';

  try {
    const response = await axios.post('https://ws.audioscrobbler.com/2.0/', null, { params });
    contadorScrobbles++;
    const logMessage = `🎶 Scrobble realizado: "${faixa}" por ${artista} em ${new Date(timestamp * 1000).toLocaleString()}. Total: ${contadorScrobbles}`;
    fs.appendFileSync('log.txt', logMessage + '\n');
    logComCorAleatoria(logMessage);
    return response.data.scrobbles;
  } catch (error) {
    console.error(
      colors.red + `⚠️ Erro ao scrobbler: "${faixa}" por ${artista}`,
      error.response ? error.response.data : error + colors.reset
    );
    throw error.response ? error.response.data : error;
  }
};

// Retorna delay entre scrobbles baseado no modo configurado
const obterDelayModo = () => {
  switch (process.env.MODE) {
    case 'FLASH':
      return 1;
    case 'TURBO':
      return 500;
    case 'SLOW':
      return 60000;
    case 'FAST':
    default:
      return 5000;
  }
};

// Gera timestamp aleatório para os últimos 7 dias
const gerarTimestampAleatorio = () => {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() - Math.floor(Math.random() * 7));
  hoje.setHours(hoje.getHours() - Math.floor(Math.random() * 24));
  hoje.setMinutes(hoje.getMinutes() - Math.floor(Math.random() * 60));
  return Math.floor(hoje.getTime() / 1000);
};

// Função principal que scrobbla faixas continuamente
const scrobblerFaixas = async () => {
  try {
    const chaveSessao = await obterChaveSessao();
    const faixas = JSON.parse(fs.readFileSync('tracks.json', 'utf8'));
    const delay = obterDelayModo();

    while (true) {
      const faixasEmbaralhadas = [...faixas];

      while (faixasEmbaralhadas.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * faixasEmbaralhadas.length);
        const infoFaixa = faixasEmbaralhadas[indiceAleatorio];

        const timestamp = gerarTimestampAleatorio();
        await scrobbleFaixa(chaveSessao, infoFaixa.track, infoFaixa.artist, infoFaixa.album, timestamp);
        await new Promise((resolve) => setTimeout(resolve, delay));

        faixasEmbaralhadas.splice(indiceAleatorio, 1);
      }
    }
  } catch (err) {
    console.error(colors.red + '❌ Erro no scrobbler:', err + colors.reset);
  }
};

// Aguarda Enter para iniciar o scrobbler
const iniciarScrobbler = () => {
  console.clear();
  process.title = 'Scrobbler | Lemlestelse';
  console.log(colors.blue + '🔔 Pressione Enter para iniciar o scrobbler...' + colors.reset);

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', async () => {
    process.stdin.removeAllListeners('data');
    process.stdin.setRawMode(false);
    console.log(colors.green + '🔄 Iniciando o scrobbler...' + colors.reset);
    await scrobblerFaixas();
  });
};

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

iniciarScrobbler();
