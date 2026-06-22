require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const configDados = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.User,
        Partials.Channel,
        Partials.GuildScheduledEvent,
    ]
});

// Coleção para guardar comandos
client.commands = new Collection();

// Sistema para carregar comandos
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ("name" in command && "execute" in command) {
        client.commands.set(command.name, command);
        console.log(`[SUCESSO] Comando carregado: ${command.name}`);
    } else {
        console.log(`[AVISO] O comando em ${filePath} está a faltar o "name" ou "execute".`);
    }
}

//ANTI-CRASH (Report de erros)
const process = require('node:process');
process.on('unhandledRejection', async (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('Uncaught Exception Monitor:', err, origin);
});    
process.on('uncaughtException', (err) => {
    console.log('UncaughtException:', err);
});

//EVENTO: BOT ONLINE
const { ActivityType } = require("discord.js");
client.once("clientReady", () => {
    console.log(`${client.user.username} está online`);
    client.user.setActivity('A jogar League of Legends!', { type: ActivityType.Playing });
});

// EVENTO: EXECUÇÃO DE COMANDOS
client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const prefixo = configDados.prefix;
    if (!message.content.startsWith(prefixo)) return;

    const args = message.content.slice(prefixo.length).trim().split(/ +/g);
    const comandoNome = args.shift().toLowerCase();
    const comando = client.commands.get(comandoNome);

    if (!comando) return;

    try {
        await comando.execute(message, args, client);
    } catch (error) {
        console.error(error);
        replyWithMessage(message, "Houve um erro ao tentar executar esse comando!");
    }
});
// Ler eventos da pasta eventos 
const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Evento carregado: ${event.name}`);
    }
}
client.login(process.env.DISCORD_TOKEN);