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
        const ID_EXCECAO_3 = "610567380162052106";
        const ID_EXCECAO_4 = "1361858340858102022"
        let tamanho;
        let frase = "";
        let gifBanana = "https://i.imgur.com/HVVh94a.gif";
       
        if (alvoID === ID_EXCECAO_1) {
            tamanho = "22 cm";
            frase = "O nosso Chamber tem sempre calibre 22 quando usa a ult!";
            gifBanana = "https://media.tenor.com/xxFPW82ZUucAAAAC/chamber-you-want-to-play-lets-play.gif";
        } else if (alvoID === ID_EXCECAO_2) {
            tamanho = "16 cm";
            frase = "Na verdade tem 16, mas eu digo sempre que é pequeno";
            gifBanana = "https://i.pinimg.com/736x/b7/b8/60/b7b8607365b5a0be295cd41507e84f2e.jpg";
        } else if (alvoID === ID_EXCECAO_3) {
            tamanho = "(Ups, não posso revelar)";
            frase = "É cor-de-rosa com 5 vibrações diferentes e o tamanho perfeito!";
            gifBanana = "https://64.media.tumblr.com/146e3f988077e0bb09b51415867b898c/tumblr_mj44w7JXyG1rnzjtwo1_500.gifv";
        } else if (alvoID === ID_EXCECAO_4) {
            tamanho = "15 cm";
            frase = "Queres saber o tamanho porque? Não vais arrancar a banana?";
            gifBanana = "https://media.tenor.com/GuZoT7rM1tgAAAAM/natsuru-transformation.gif";
        
        
        } else {
            tamanho = `${Math.floor(Math.random() * 31)} cm`;

            if (tamanho === "0 cm") {
                frase = "Só com a ajuda de um microscópio é que se consegue ver...";
            } else if (parseInt(tamanho) < 10) {
                frase = "Se souber usar não está assim tão mau!";
            } else if (parseInt(tamanho) < 18) {
                frase = " Um tamanho perfeitamente humilde e honesto!";
            } else if (parseInt(tamanho) < 26) {
                frase = "Eish, se isso entrar em mim amanhã já não ando!";
            } else {
                frase = "Lendário! Isso já conta como uma arma branca!";
            }
        }

        const embedBanana = new EmbedBuilder()
            .setColor("#4c0655")
            .setTitle("🍌 Medidor da Banana")
            .setDescription(`A banana de ${alvo} tem exatamente **${tamanho}**!\n\n_${frase}_`)
            .setImage(gifBanana) 
            
            .setFooter({
                text: `Medido a pedido de ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // 4. Envia a resposta
        await message.reply({ embeds: [embedBanana] });
    }
};