# 🎶 **Scrobbler LastFM** 🚀

Este é um **scrobbler automatizado para o LastFM**, criado para facilitar o envio de faixas para o LastFM e exibir o que você está "escutando" diretamente no seu **Discord**, com um *Rich Presence* super estiloso! 🤩

## 🎯 **Funcionalidades**

- **Modo de Atraso Configurável** (TURBO, SLOW, FAST)
- **Geração Aleatória de Timestamps** ⏳
- **Logs com Cores Aleatórias** 🌈
- **Integração Completa com o Discord** 🔗
- **Contador de Scrobbles** 🏆

Além disso, você pode facilmente **adicionar novas faixas**, escolher o tempo de espera entre os scrobbles e acompanhar seu progresso com um contador de scrobbles. 👀

---

## 🛠️ **Como Funciona?**

### 1. **Configuração Inicial:**
- **Arquivo `.env`**: Contém as credenciais necessárias para o acesso à API do LastFM (API_KEY, LOGIN, PASSWORD, SECRET).
- **Arquivo `tracks.json`**: Contém as faixas que serão scrobbladas. Cada faixa deve estar no formato:

    ```json
    {
      "track": "Nome da faixa",
      "artist": "Nome do artista",
      "album": "Nome do álbum"
    }
    ```

### 2. **Discord Rich Presence**:
- Seu status no Discord será atualizado automaticamente, mostrando a **faixa** e **artista** atual, além de um contador de scrobbles em tempo real. 🔥

### 3. **Funcionalidades**:
- **Scrobble Automático**: As faixas do seu arquivo `tracks.json` são enviadas automaticamente para o LastFM.
- **Timestamps Aleatórios**: As faixas são scrobbled com timestamps aleatórios, criando uma escuta contínua e realista.
- **Modo de Atraso**: O tempo entre cada scrobble pode ser ajustado para **TURBO**, **SLOW** ou **FAST**, conforme sua preferência.
- **Logs Coloridos**: As mensagens de log são exibidas com cores dinâmicas para dar um toque divertido no processo. 🌈

---

## 🧰 **Estrutura do Projeto**

- **`.env`**: Contém as variáveis de ambiente, como `API_KEY`, `LOGIN`, `PASSWORD` e `SECRET` para autenticação na API do LastFM.
- **`index.js`**: O código principal que controla a lógica de scrobbling, a integração com o Discord, e a comunicação com a API do LastFM.
- **`install.bat`**: Script para instalação das dependências do projeto em sistemas Windows.
- **`package.json`**: O arquivo de configuração do Node.js com todas as dependências do projeto.
- **`start.bat`**: Script para iniciar o servidor e o scrobbler.

---

## 📥 **Como Usar?**

### 1. **Instale as Dependências**
Execute o script `install.bat` para instalar as dependências do projeto.

### 2. **Configure o Arquivo `.env`**
Configure as credenciais da sua conta LastFM no arquivo `.env`. Para obter a sua **API Key** e **Secret**, siga os passos abaixo:

#### Como Obter a API Key e o Secret do LastFM:
- Acesse [LastFM Developer](https://www.last.fm/api).
- Faça login com a sua conta LastFM ou crie uma se ainda não tiver.
- Depois de logado, clique em **"Create an API account"** (Criar uma conta de API).
- Preencha o formulário com o nome do aplicativo (ex: `Meu Scrobbler`) e a descrição.
- Após a criação, você verá a sua **API Key** e **Secret**. Copie esses valores e cole-os no seu arquivo `.env`.

Agora, o arquivo `.env` deve ser configurado da seguinte forma:

```bash
API_KEY=your_api_key_here
LOGIN=your_lastfm_username_here
PASSWORD=your_lastfm_password_here
SECRET=your_api_secret_here
MODE=FAST  # Pode ser TURBO, SLOW ou FAST
```

### 3. **Adicione Faixas ao Arquivo tracks.json**
Preencha o arquivo tracks.json com faixas no seguinte formato:

```bash[
  {
    "track": "Nome da faixa",
    "artist": "Nome do artista",
    "album": "Nome do álbum"
  }
]
```
### 4. **Inicie o Scrobbler**  
Execute o script `start.bat` para rodar o servidor e começar o processo de scrobbling.

### 5. **Veja o Resultado no Discord**  
Seu status do Discord será atualizado com as faixas que você está escutando, com informações sobre o artista e a música. 🎧✨

## 📝 **Funções Principais**
- **gerarAssinaturaApi**: Gera a assinatura necessária para autenticar na API do LastFM.
- **obterChaveSessao**: Realiza o login na conta LastFM e obtém a chave de sessão para realizar os scrobbles.
- **scrobblerFaixas**: Processa as faixas no `tracks.json` e envia os scrobbles para o LastFM, com atrasos configuráveis.
- **atualizarRichPresence**: Atualiza o status do Discord com a música e o artista atual.

## 🙏 **Créditos**
Desenvolvido com 💖 por Lemlestelse.

Este projeto foi feito para ser útil e divertido! Sinta-se à vontade para contribuir, adicionar novas funcionalidades ou corrigir bugs. 😎
