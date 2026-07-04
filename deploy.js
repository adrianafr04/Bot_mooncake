const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Carrega as variáveis do ficheiro .env
require('dotenv').config(); 

const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID || process.env.CLIENTID;
const guildId = process.env.GUILD_ID || process.env.GUILDID;


if (!token || !clientId || !guildId) {
    console.error(" Erro: Faltam dados no teu ficheiro .env!");
    console.error(`> Token encontrado: ${token ? "Sim" : "Não"}`);
    console.error(`> Client ID encontrado: ${clientId ? "Sim" : "Não"}`);
    console.error(`> Guild ID encontrado: ${guildId ? "Sim" : "Não"}`);
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`A atualizar ${commands.length} comandos slash (/) GLOBALMENTE na API do Discord...`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Sucesso! ${data.length} comandos slash foram registados globalmente.`);
    } catch (error) {
        console.error(error);
    }
})();