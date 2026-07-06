const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: "play",
    aliases: ["p"],
    description: "Toca uma música do YouTube (aceita link ou nome)",
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música do YouTube')
        .addStringOption(option => 
            option.setName('musica')
                .setDescription('O nome ou link da música que queres ouvir')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const canalVoz = interaction.member.voice.channel;
        
        if (!canalVoz) {
            return interaction.reply({ content: '❌ Precisas de estar num canal de voz para tocar música!', ephemeral: true });
        }

        if (!canalVoz.joinable || !canalVoz.speakable) {
            return interaction.reply({ content: '❌ Eu não tenho permissão para entrar ou falar no teu canal de voz!', ephemeral: true });
        }

        await interaction.deferReply();
        const query = interaction.options.getString('musica');

        try {
            await client.distube.play(canalVoz, query, {
                textChannel: interaction.channel,
                member: interaction.member,
                interaction
            });
            
            await interaction.editReply({ content: `🔍 A pesquisar por: \`${query}\`...` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar reproduzir a música.' });
        }
    },

    async executePrefix(message, args, client) {
        const canalVoz = message.member.voice.channel;
        
        if (!canalVoz) {
            return message.reply('❌ Precisas de estar num canal de voz para tocar música!');
        }

        const query = args.join(' ');
        if (!query) {
            return message.reply('❌ Escreve o nome ou o link da música. Exemplo: `!p linkin park`');
        }

        try {
            await message.reply(`🔍 A pesquisar por: \`${query}\`...`);

            await client.distube.play(canalVoz, query, {
                textChannel: message.channel,
                member: message.member,
                message
            });
        } catch (error) {
            console.error(error);
            await message.reply('❌ Ocorreu um erro ao tentar reproduzir a música.');
        }
    }
};