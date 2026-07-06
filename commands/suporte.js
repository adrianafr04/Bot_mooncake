const { 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType
} = require('discord.js');

module.exports = {
    name: "suporte",
    description: "Criação do menu ticket de suporte",
    data: new SlashCommandBuilder()
        .setName('suporte')
        .setDescription('Criação do menu ticket de suporte')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Apenas Admins
    async execute(interaction) {
        // Garantir que apenas administradores usam
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Apenas administradores podem configurar o canal de suporte.', ephemeral: true });
        }

        await enviarPainel(interaction.channel);
        await interaction.reply({ content: '✅ Painel de suporte configurado com sucesso neste canal!', ephemeral: true });
    },

    async run(client, message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(' Apenas administradores podem configurar o canal de suporte.');
        }

        const canal = message.mentions.channels.first() || message.channel;

        await enviarPainel(canal);
        return message.reply(`Painel de suporte configurado com sucesso em ${canal}!`);
    }
};

async function enviarPainel(channel) {
    const embed = new EmbedBuilder()
        .setTitle(' Sistema de Suporte')
        .setDescription('Precisas de ajuda? Clica no botão abaixo para abrir um ticket de suporte.\nA nossa equipa irá responder o mais rápido possível.')
        .setColor('#58084b');

    const button = new ButtonBuilder()
        .setCustomId('abrir_ticket')
        .setLabel('Abrir Ticket')
        .setEmoji('📩')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] });
}