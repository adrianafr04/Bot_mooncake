const { EmbedBuilder } = require("discord.js");
const configDados = require("../config.json"); // Sobe uma pasta para ler o prefixo

module.exports = {
    name: "help",
    description: "Mostra a lista com todos os comandos disponíveis de Mooncake",
    async execute(message, args, client) {
        const prefixo = configDados.prefix;

        // 1. Pega todos os comandos guardados na memória do bot
        const comandos = client.commands;

        // 2. Cria a Embed de ajuda
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Painel de Comandos do Mooncake")
            .setDescription(`Aqui está a lista de tudo o que posso fazer por ti! O meu prefixo atual é \`${prefixo}\`.`)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: `Solicitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

        // 3. Adiciona cada comando dinamicamente à Embed
        comandos.forEach((comando) => {
            embed.addFields({
                name: `\`${prefixo}${comando.name}\``,
                value: comando.description || "Sem descrição disponível.",
                inline: false // Deixa um comando por linha para ficar organizado
            });
        });

        // 4. Envia a resposta para o canal
        await message.reply({ embeds: [embed] });
    }
};