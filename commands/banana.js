const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "banana",
    description: "Mede o tamanho da banana de um utilizador",
    async execute(message, args, client) {
        //Pega no utilizador mencionado ou em quem enviou o comando
        const alvo = message.mentions.members.first() || message.member;
        const alvoID = alvo.id;

      //Exceções
        const ID_EXCECAO_1 = "1303867204441210903"; 
        const ID_EXCECAO_2 = "867044372565327912"; 
        let tamanho;
        let frase = "";
        let gifBanana = "https://i.imgur.com/HVVh94a.gif"
       
        if (alvoID === ID_EXCECAO_1) {
            tamanho = 22;
            frase = "O nosso Chamber tem sempre calibre 22 quando usa a ult!";
            gifBanana = "https://media.tenor.com/xxFPW82ZUucAAAAC/chamber-you-want-to-play-lets-play.gif"
        } else if (alvoID === ID_EXCECAO_2) {
            tamanho = 16;
            frase = "Na verdade tem 16, mas eu digo sempre que é pequeno";
            gifBanana = "https://i.imgflip.com/8tax5p.jpg"
        } else {
            tamanho = Math.floor(Math.random() * 31);

            if (tamanho === 0) {
                frase = "Só com a ajuda de um microscópio é que se consegue ver...";
            } else if (tamanho < 10) {
                frase = "Se souber o usar não está assim tão mau!";
            } else if (tamanho < 18) {
                frase = " Um tamanho perfeitamente humilde e honesto.";
            } else if (tamanho < 26) {
                frase = "Eish, se isso entrar em mim amanhã já não ando!";
            } else {
                frase = "Lendário! Isso já conta como uma arma branca!";
            }
        }
        const embedBanana = new EmbedBuilder()
            .setColor("#4c0655")
            .setTitle("🍌 Medidor da Banana")
            .setDescription(`A banana de ${alvo} tem exatamente **${tamanho} cm**!\n\n_${frase}_`)
            .setImage("gifBanana") 
            
            .setFooter({
                text: `Medido a pedido de ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // 4. Envia a resposta
        await message.reply({ embeds: [embedBanana] });
    }
};