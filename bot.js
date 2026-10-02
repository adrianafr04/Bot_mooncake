require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Collection, Events, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, REST, Routes } = require("discord.js");
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
const commandsSlashData = [];

// Sistema para carregar comandos
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ((command.data || command.name) && (command.execute || command.executePrefix)) {
        const name = command.data ? command.data.name : command.name;
        client.commands.set(name, command);
        if (command.data) {
            commandsSlashData.push(command.data.toJSON());
        }
        console.log(`Comando carregado: ${name}`);
    } else {
        console.log(`⚠️ O comando em ${filePath} está com uma estrutura inválida.`);
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

// Bot online e atividade 
const { ActivityType } = require("discord.js");
client.once(Events.ClientReady, async () => {
    console.log(`${client.user.username} está online`);
    client.user.setActivity('Thinking about new features', { type: ActivityType.Playing });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsSlashData },
        );
    } catch (error) {
        console.error(error);
    }
});

// Comandos por prefixo
client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const prefixo = configDados.prefix;
    if (!message.content.startsWith(prefixo)) return;

    const args = message.content.slice(prefixo.length).trim().split(/ +/g);
    const comandoNome = args.shift().toLowerCase();
    
    const comando = client.commands.get(comandoNome) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(comandoNome));

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

// Sistema de Interações 
client.on("interactionCreate", async interaction => {
    
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
        return;
    }

    if (interaction.isButton() && interaction.customId === 'abrir_ticket') {
        const modal = new ModalBuilder()
            .setCustomId('modal_ticket')
            .setTitle('Formulário de Suporte');

        const descricaoInput = new TextInputBuilder()
            .setCustomId('descricao_problema')
            .setLabel('Descreve o teu problema')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Explica detalhadamente o que aconteceu...')
            .setRequired(true)
            .setMinLength(10);

        modal.addComponents(new ActionRowBuilder().addComponents(descricaoInput));
        return await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_ticket') {
        await interaction.deferReply({ ephemeral: true });

        const descricao = interaction.fields.getTextInputValue('descricao_problema');
        const guild = interaction.guild;
        const membro = interaction.user;

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${membro.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { 
                        id: membro.id, 
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
                    }
                ],
            });

            const adminRoles = guild.roles.cache.filter(role => role.permissions.has(PermissionFlagsBits.Administrator));
            for (const [id, role] of adminRoles) {
                await ticketChannel.permissionOverwrites.edit(role.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }

            const embedTicket = new EmbedBuilder()
                .setTitle(`🎫 Ticket de ${membro.tag}`)
                .setDescription(`**Descrição do Problema:**\n${descricao}`)
                .setColor('#570753')
                .setTimestamp();

            const botaoFechar = new ButtonBuilder()
                .setCustomId('fechar_ticket')
                .setLabel('Fechar Ticket')
                .setStyle(ButtonStyle.Danger);

            const mensionAdmins = adminRoles.map(role => `<@&${role.id}>`).join(' ') || "Admins";

            await ticketChannel.send({ 
                content: `${membro} | ${mensionAdmins}`,
                embeds: [embedTicket], 
                components: [new ActionRowBuilder().addComponents(botaoFechar)] 
            });

            await interaction.editReply({ content: ` O teu ticket foi criado em ${ticketChannel}!` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: ' Erro crítico ao gerar a sala do ticket.' });
        }
    }

    if (interaction.isButton() && interaction.customId === 'fechar_ticket') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: ' Apenas administradores podem fechar este ticket.', ephemeral: true });
        }
        
        await interaction.reply(' Este ticket será eliminado em 5 segundos...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
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