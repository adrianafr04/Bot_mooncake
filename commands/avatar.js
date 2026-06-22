const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Mostra o avatar de um utilizador",
    async execute(message, args, client) {
        // Procura o utilizador: se alguém for mencionado, usa essa pessoa; 
        // se usarem uma ID, procura pela ID; se não puserem nada, usa quem enviou a mensagem.
        let membro = message.mentions.users.first() || 
                     client.users.cache.get(args[0]) || 
                     message.author;

        // Mensagem que aparece com a foto de perfil
        const embed = new EmbedBuilder()
            .setColor("#4b0947") // Cor do painel
            .setTitle(` Avatar de ${membro.username}`)
            .setDescription(`[Clique aqui para descarregar a foto de perfil](${membro.displayAvatarURL({ dynamic: true, size: 2048 })})`)
            .setImage(membro.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `Solicitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

        // Envia a embed para o canal
        await message.reply({ embeds: [embed] });
    }
};