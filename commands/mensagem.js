const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ChannelSelectMenuBuilder 
} = require('discord.js');

module.exports = {
    name: "mensagem",
    description: "Envia uma mensagem personalizada para um determinado canal",
    permissions: [PermissionFlagsBits.Administrator], // apenas para administradores

    data: new SlashCommandBuilder()
        .setName('mensagem')
        .setDescription('Envia uma mensagem personalizada para um determinado canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Bloqueia o comando para administradores

    async execute(interaction, client) {
        // Criar o Embed bonito
        const embed = new EmbedBuilder()
            .setTitle("Escreva uma mensagem")
            .setDescription("Selecione o canal de destino no menu abaixo. Após a seleção, abrir-se-á uma janela para escrever o conteúdo da mensagem.")
            .setColor('#4e094b') // Roxo defaut
            .setTimestamp() // Adiciona a hora atual no fundo
            .setFooter({ 
                text: `Solicitado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // Menu de seleção que lista automaticamente os canais de texto do servidor
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('selecionar_canal_embed')
            .setPlaceholder('Escolha o canal de destino...')
            .addChannelTypes(ChannelType.GuildText); // apenas canais de texto 

        const row = new ActionRowBuilder().addComponents(selectMenu);

        try {
            // Envia o painel inicial com o menu para o utilizador
            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Ocorreu um erro ao tentar abrir o painel.', 
                ephemeral: true 
            });
        }
    },

    // Adicionado: Execução via prefixo para evitar o erro de crash
    async executePrefix(message, args, client) {
        // Verificar se é Adminstrador no prefixo
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(" Este comando é exclusivo para Administradores do servidor!");
        }

        // Criar o Embed bonito
        const embed = new EmbedBuilder()
            .setTitle(" Escreva uma mensagem ")
            .setDescription("Selecione o canal de destino no menu abaixo. Após a seleção, abrir-se-á uma janela para escrever o conteúdo da mensagem.")
            .setColor('#4e094b') // Roxo defaut
            .setTimestamp() // Adiciona a hora atual no fundo
            .setFooter({ 
                text: `Solicitado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        // Menu de seleção que lista automaticamente os canais de texto do servidor
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('selecionar_canal_embed')
            .setPlaceholder('Escolha o canal de destino...')
            .addChannelTypes(ChannelType.GuildText); // apenas canais de texto 

        const row = new ActionRowBuilder().addComponents(selectMenu);

        try {
            // Envia o painel inicial com o menu para o utilizador
            await message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error(error);
            await message.reply('Ocorreu um erro ao tentar abrir o painel.');
        }
    }
};