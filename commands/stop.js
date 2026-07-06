const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: "stop",
    aliases: ["s"],
    description: "Para a música atual, limpa a fila e sai do canal de voz.",
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a música, limpa a fila e sai do canal de voz'),

    async execute(interaction, client) {
        const canalVoz = interaction.member.voice.channel;
        
        if (!canalVoz) {
            return interaction.reply({ content: '❌ Precisas de estar num canal de voz para parar a música!', ephemeral: true });
        }

        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ Não há nenhuma música a tocar neste servidor.', ephemeral: true });
        }

        try {
            await queue.stop();
            await interaction.reply({ content: '⏹️ A reprodução foi interrompida!' });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar parar a música.', ephemeral: true });
        }
    },

    async executePrefix(message, args, client) {
        const canalVoz = message.member.voice.channel;
        
        if (!canalVoz) {
            return message.reply('❌ Precisas de estar num canal de voz para parar a música!');
        }

        const queue = client.distube.getQueue(message.guildId);
        if (!queue) {
            return message.reply('❌ Não há nenhuma música a tocar neste servidor.');
        }

        try {
            await queue.stop();
            await message.reply('⏹️ A reprodução foi interrompida!');
        } catch (error) {
            console.error(error);
            await message.reply('❌ Ocorreu um erro ao tentar parar a música.');
        }
    }
};