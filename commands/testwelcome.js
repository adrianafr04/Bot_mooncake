const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "welcome", 
    description: "Teste de boas-vindas",
    async execute(message, args, client) {
        // Usa quem enviou o comando para simular o novo membro
        const membro = message.member;
        const canalPrincipalID = "1392475192730845195"; 
        const nomesPermitidos = ["welcome", "bem-vindo", "boas-vindas"];

        //tenta encontrar call pelo ID
        let canal = message.guild.channels.cache.get(canalPrincipalID);

        // procura por nomes padrão
        if (!canal || !canal.isTextBased()) {
            canal = message.guild.channels.cache.find(c => 
                nomesPermitidos.includes(c.name.toLowerCase()) && c.isTextBased()
            );
        }

        // Se mesmo assim não encontrar nenhum canal válido
        if (!canal) {
            return message.reply(
                " Não encontrei o canal pelo ID e nenhum canal chamado `welcome`, `bem-vindo` ou `boas-vindas` existe neste servidor!"
            );
        }

        // --- EMBED IGUAL AO DO EVENTS/WELCOME.JS ---
        const embedWelcome = new EmbedBuilder()
            .setColor("#4c0655")
            .setTitle("🎉 Bem-vindo(a) ao nosso servidor! 🎉")
            .setDescription(
                `Olá, ${membro}! Seja muito bem-vindo(a) à nossa comunidade. Estamos felizes por ter você aqui!\n\n` +
                `📌 **Não se esqueça de ler as regras** para garantir uma boa convivência com todos.\n\n` +
                `💬 **Apresente-se, participe das conversas** e aproveite tudo o que o servidor oferece.\n\n` +
                `🤝 **Nossa equipe está à disposição** caso você tenha alguma dúvida ou precise de ajuda.\n\n` +
                `Desejamos uma ótima experiência e esperamos que você se divirta bastante! 🚀`
            )
            .setThumbnail(membro.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage("https://i.pinimg.com/originals/b0/45/fc/b045fc647b6a4a4bc2dd3d31f4a948ef.gif") 
            .setFooter({ 
                text: `${membro.guild.name} • Membro nº ${membro.guild.memberCount} (Simulação)`, 
                iconURL: membro.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        // Envia as mensagens no canal correto encontrado por ID
        await message.reply(` Simulação enviada com sucesso para o canal ${canal}!`);
        await canal.send({ content: ` Ei ${membro}, chegaste!`, embeds: [embedWelcome] });
    }
};