const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "mensagem",
    description: "Envia uma mensagem personalizada para um determinado canal",
    permissions: [PermissionFlagsBits.Administrator], // apenas para administradores

    data: new SlashCommandBuilder()
        .setName('mensagem')
        .setDescription('Envia uma mensagem personalizada para um determinado canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Bloqueia o comando para administradores
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal para onde a mensagem será enviada')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText) // apenas canais de texto 
        )
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('O título da mensagem')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('descricao')
                .setDescription('A conteúdo da mensagem (usa \n para passar de linha)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('cor')
                .setDescription('Escolhe a cor da barra lateral (Ex: #FF0000 para Vermelho)')
                .setRequired(false)
        ),

    async execute(interaction) {
        // Obter os dados que o utilizador escreveu no comando
        const targetChannel = interaction.options.getChannel('canal');
        const title = interaction.options.getString('titulo');
        const description = interaction.options.getString('descricao');
        const colorHex = interaction.options.getString('cor') || '#4e094b'; // Roxo defaut

        // Criar o Embed bonito
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description.replace(/\\n/g, '\n')) // Permite quebras de linha se escreverem \n
            .setColor(colorHex)
            .setTimestamp() // Adiciona a hora atual no fundo
            .setFooter({ 
                text: `Enviado por ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        try {
            // Envia o embed para o canal pretendido
            await targetChannel.send({ embeds: [embed] });

            // 4. Responder à interação (apenas visível para quem usou o comando) para confirmar o envio
            await interaction.reply({ 
                content: `Embed enviado com sucesso para o canal ${targetChannel}!`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Ocorreu um erro ao tentar enviar o embed. Verifica se eu tenho permissões para falar no canal.', 
                ephemeral: true 
            });
        }
    },

    // Adicionado: Execução via prefixo para evitar o erro de crash
    async executePrefix(message, args, client) {
        // Verificar se é Administrador no prefixo
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Este comando é exclusivo para Administradores do servidor!");
        }

        const targetChannel = message.mentions.channels.first();
    
        const resto = args.slice(1).join(' ');

        if (!targetChannel || !resto.includes('|')) {
            return message.reply("**Uso incorreto!** Usa desta forma:\n`!mensagem #canal O Título Aqui | A Descrição Aqui (podes usar \\n)`");
        }

        const partes = resto.split('|');
        const title = partes[0].trim();
        const description = partes[1].trim();

        // Criar o Embed bonito
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description.replace(/\\n/g, '\n')) // Permite quebras de linha se escreverem \n
            .setColor('#4e094b') // Roxo defaut
            .setTimestamp() // Adiciona a hora atual no fundo
            .setFooter({ 
                text: `Enviado por ${message.author.tag}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        try {
            // Envia o embed para o canal pretendido
            await targetChannel.send({ embeds: [embed] });

            // Responder para confirmar o envio
            await message.reply(`Embed enviado com sucesso para o canal ${targetChannel}!`);
        } catch (error) {
            console.error(error);
            await message.reply('Ocorreu um erro ao tentar enviar o embed. Verifica se eu tenho permissões para falar no canal.');
        }
    }
};