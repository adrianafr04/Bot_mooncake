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

client.commands = new Collection();

// Sistema para carregar comandos
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Alterado para verificar se tem o objeto "data" (dos Slash Commands) OU o "name" tradicional
    if ((command.data || command.name) && (command.execute || command.executePrefix)) {
        //Guarda na coleção usando o nome correto (seja do Slash ou do Prefixo)
        const name = command.data ? command.data.name : command.name;
        client.commands.set(name, command);
        console.log(`[SUCESSO] Comando carregado: ${name}`);
    } else {
        console.log(`[AVISO] O comando em ${filePath} está com uma estrutura inválida.`);
    }
}

// Report de erros
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

// bot online e atividade
const { ActivityType } = require("discord.js");
client.once("clientReady", () => {
    console.log(`${client.user.username} está online`);
    client.user.setActivity('Eu vou coringar HAHAHAHAHA!', { type: ActivityType.Playing });
});

// comandos por prefixo
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
        if (comando.executePrefix) {
            await comando.executePrefix(message, args, client);
        } else if (comando.execute) {
            await comando.execute(message, args, client);
        }
    } catch (error) {
        console.error(error);
        await message.reply("Houve um erro ao tentar executar o comando!");
    }
});

client.on("interactionCreate", async interaction => {
    // Executa apenas se for um comando de texto (Slash)
    if (interaction.isChatInputCommand()) {
        const comando = client.commands.get(interaction.commandName);
        if (!comando) return;

        try {
            if (comando.execute) {
                await comando.execute(interaction, client);
            }
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Houve um erro ao executar o comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Houve um erro ao executar o comando!', ephemeral: true });
            }
        }
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