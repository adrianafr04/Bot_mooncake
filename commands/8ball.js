const { EmbedBuilder, SlashCommandSubcommandBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "bot",
    description: "Faz uma pergunta à bola mágica e ela responderá",
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Faz uma pergunta à bola mágica e ela responderá'),
    async execute(message, args, client) {
        // 1. Verifica se o usuário fez uma pergunta
        const pergunta = args.join(" ");
        if (!pergunta) {
            return message.reply(" Precisas de fazer uma pergunta! Exemplo: `!bot O Mooncake é o melhor bot?`");
        }

        // 2. Lista de respostas possíveis da Bola Mágica
        const respostas = [
            // Respostas Positivas
            "Com certeza!",
            "Sim, absolutamente.",
            "Sem dúvida alguma.",
            "As minhas fontes dizem que sim.",
            "Parece-me que sim!",
            "Segundo os dados da minha base de dados, sim!!",
            
            // Respostas Neutras/Indecisas
            "Pergunta novamente mais tarde...",
            "Melhor não te responder agora.",
            "Não consigo prever isso neste momento.",
            "Concentra-te e pergunta de novo.",
            "Erro no sistema, infelizmente não posso responder neste momento",
            "Chamas-te-me só para isso? Que pergunta sem sentido",
            
            // Respostas Negativas
            "Não contes com isso.",
            "A minha resposta é não.",
            "As minhas fontes dizem que não.",
            "Muito improvável.",
            "Cenário pouco provável.",
            "Nahhh.",
            "Segundo os meus cálculos, não!",
            "Definitivamente não",
            "Duvidoso, mas não!",
        ];

        // 3. Escolhe uma resposta aleatória da lista
        const respostaAleatoria = respostas[Math.floor(Math.random() * respostas.length)];

        // 4. Cria uma Embed bonita com a resposta
        const embed8ball = new EmbedBuilder()
            .setColor("#4c0655") 
            .setTitle(" Bola Mágica da Mooncake")
            .setDescription(`${respostaAleatoria}`)
            .setImage("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUydHVvN2RpeW04YWs2eXhvem83eHhoZjNnYmVvb3NlcGM2YThxZGtsMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/zgGrSqSi3SSqs/giphy.gif")
            .setFooter({ 
                text: `Consultado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();
        await message.reply({ embeds: [embed8ball] });
    }
};