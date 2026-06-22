require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const configDados = require("./config.json");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent ]
});
const { ActivityType } = require("discord.js");
client.once("clientReady", () => {
    console.log("Mooncake está online!!");
    client.user.setActivity('A levar com o calibre 22!', { type: ActivityType.Playing });

});
client.on("messageCreate", async message => {
     // Impedir que o bot responda a outros bots ou por DM
     if(message.author.bot) return;
     if (!message.guild) return;
     // Pega o prefixo do config.json
     const prefixo = configDados.prefix;
     // Verifica se a mensagem começa com !
     if (!message.content.startsWith(prefixo)) return;

     const args = message.content.slice(prefixo.length).trim().split(/ +/g);
     const comando = args.shift().toLowerCase();
     //Configuração do comando ping
    if(comando === "ping") {
    const m = await message.channel.send("Ping?");
    const latenciaLocal = m.createdTimestamp - message.createdTimestamp;
    const latenciaAPI = Math.round(client.ws.ping);
    await m.edit(`Olá! \nEstou online, Latência é de **${latenciaLocal}ms**. Latência da API é de **${latenciaAPI}ms**.`);
    }
  });



client.login(process.env.DISCORD_TOKEN);