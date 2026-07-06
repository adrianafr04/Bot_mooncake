const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: "skip",
    aliases: ["sk"],
    description: "Salta a música que está a tocar atualmente.",
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a música atual'),

    async execute(interaction, client) {
        const canalVoz = interaction.member.voice.channel;
        
        if (!canalVoz) {
            return interaction.reply({ content: '❌ Precisas de estar num canal de voz para saltar a música!', ephemeral: true });
        }

        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ Não há nenhuma música a tocar neste servidor.', ephemeral: true });
        }

        try {
            if (!queue.autoplay && queue.songs.length <= 1) {
                return interaction.reply({ content: '❌ Não há mais músicas na fila para saltar! Usa `!stop` se quiseres parar.', ephemeral: true });
            }

            const musicaSaltada = await client.distube.skip(interaction.guildId);
            await interaction.reply({ content: `⏭️ Skip com sucesso!` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar saltar a música.', ephemeral: true });
        }
    },

    async executePrefix(message, args, client) {
        const canalVoz = message.member.voice.channel;
        
        if (!canalVoz) {
            return message.reply('❌ Precisas de estar num canal de voz para saltar a música!');
        }

        const queue = client.distube.getQueue(message.guildId);
        if (!queue) {
            return message.reply('❌ Não há nenhuma música a tocar neste servidor.');
        }

        try {
            if (!queue.autoplay && queue.songs.length <= 1) {
                return message.reply('❌ Não há mais músicas na fila para saltar! Usa `!stop` se quiseres parar.');
            }

            await client.distube.skip(message.guildId);
            await message.reply('⏭️ Skip com sucesso!');
        } catch (error) {
            console.error(error);
            await message.reply('❌ Ocorreu um erro ao tentar saltar a música.');
        }
    }
};