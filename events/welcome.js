const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberAdd", // Nome do evento do Discord
    once: false,           // Executa sempre que alguém entrar
    async execute(membro, client) {
        // Lista de nomes permitidos para o canal de boas-vindas
        const nomesPermitidos = ["welcome", "bem-vindo", "boas-vindas"];
        const canalPrincipalID = "1392475192730845195";
        // Procura no servidor um canal de texto que tenha um dos nomes da lista
        let canal = membro.guild.channels.cache.get(canalPrincipalID);

        if (!canal || !canal.isTextBased()) {
            canal = membro.guild.channels.cache.find(c => 
                nomesPermitidos.includes(c.name.toLowerCase()) && c.isTextBased()
            );
        }

        if (!canal) return;

        const embedWelcome = new EmbedBuilder()
            .setColor("#4c0655")
            .setTitle("🎉 Bem-vindo(a) ao nosso servidor! ")
            .setDescription(
                `Olá, ${membro}! Seja muito bem-vindo(a) à nossa comunidade. Estamos felizes por ter você aqui!\n\n` +
                `📌 **Não se esqueça de ler as regras** para garantir uma boa convivência com todos.\n\n` +
                `💬 **Apresente-se, participe das conversas** e aproveite tudo o que o servidor oferece.\n\n` +
                `🤝 **Nossa equipe está à disposição** caso você tenha alguma dúvida ou precise de ajuda.\n\n` +
                `Desejamos uma ótima experiência e esperamos que você se divirta bastante! 🚀`
            )
            .setThumbnail(membro.user.displayAvatarURL({ dynamic: true, size: 256 }))
            
            // Link do gif
            .setImage("https://i.pinimg.com/originals/4d/00/df/4d00df1f7eaf65ec63cae3739773e6c1.gif") 
            
            .setFooter({ 
                text: `${membro.guild.name} • Membro nº ${membro.guild.memberCount}`, 
                iconURL: membro.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        await canal.send({ content: `Ei ${membro}, chegaste!`, embeds: [embedWelcome] });
    }
};