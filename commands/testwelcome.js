const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "welcome",
    description: "Testa a Embed de boas-vindas do ficheiro events/welcome.js",
    async execute(message, args, client) {
        // Usa quem enviou o comando para simular o novo membro
        const membro = message.member;
        const canalPrincipalID = "1392475192730845195";
        // Lista de nomes permitidos para o canal de boas-vindas
        const nomesPermitidos = ["welcome", "bem-vindo", "boas-vindas"];

        // Procura o canal no servidor atual
        const canal = message.guild.channels.cache.find(c => 
            nomesPermitidos.includes(c.name.toLowerCase()) && c.isTextBased()
        );

        if (!canal) {
            return message.reply(
                " Não encontrei nenhum canal chamado `welcome`, `bem-vindo` ou `boas-vindas` neste servidor!"
            );
        }


        const embedWelcome = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Bem-vindo(a) ao nosso servidor!")
            .setDescription(
                `Olá, ${membro}! Seja muito bem-vindo(a) à nossa comunidade. Estamos felizes por ter você aqui!\n\n` +
                `📌 **Não se esqueça de ler as regras** para garantir uma boa convivência com todos.\n\n` +
                `💬 **Apresente-se, participe das conversas** e aproveite tudo o que o servidor oferece.\n\n` +
                `🤝 **Nossa equipe está à disposição** caso você tenha alguma dúvida ou precise de ajuda.\n\n` +
                `Desejamos uma ótima experiência e esperamos que você se divirta bastante! 🚀`
            )
            .setThumbnail(membro.user.displayAvatarURL({ dynamic: true, size: 256 }))
            
            // Certifica-te de manter aqui o mesmo link de imagem/GIF que usares no events/welcome.js!
            .setImage("https://i.imgur.com/LinkDoSeuGifAqui.gif") 
            
            .setFooter({ 
                text: `${membro.guild.name} • Membro nº ${membro.guild.memberCount} (Simulação)`, 
                iconURL: membro.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        // Envia o aviso e a embed de teste
        await message.reply(` Simulação enviada com sucesso para o canal ${canal}!`);
        await canal.send({ content: `👋 Ei ${membro}, chegaste! (Teste do Handler)`, embeds: [embedWelcome] });
    }
};