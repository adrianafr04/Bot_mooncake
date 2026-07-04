const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const configDados = require("../config.json");

module.exports = {
    name: "help",
    description: "Mostra a lista com todos os comandos disponíveis de Mooncake",
    
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra a lista com todos os comandos disponíveis de Mooncake'),
    async execute(interaction, client) {
        const { embed, ephemeral } = gerarEmbedHelp(interaction.member, interaction.user, client);
        await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    },
    async executePrefix(message, args, client) {
        const { embed } = gerarEmbedHelp(message.member, message.author, client);
        await message.reply({ embeds: [embed] });
    }
};

function gerarEmbedHelp(membro, utilizador, client) {
    const prefixo = configDados.prefix;
    const comandos = client.commands;

// Criação do embed de help
    const embed = new EmbedBuilder()
        .setColor("#a817c5")
        .setTitle("Painel de Comandos do Mooncake")
        .setDescription(`Aqui está a lista de tudo o que posso fazer por ti! O meu prefixo atual é \`${prefixo}\`.`)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Solicitado por ${utilizador.username}`, iconURL: utilizador.displayAvatarURL() });

    // Arrays para guardar as listas de texto temporariamente
    const comandosNormais = [];
    const comandosAdmin = [];

    // Filtrar e separar os comandos
    comandos.forEach((comando) => {
        const textoComando = `\`${prefixo}${comando.name}\` - ${comando.description || "Sem descrição disponível."}`;
        
        // Verifica se o comando tem a tranca de permissões no Slash Command
        const eComandoAdmin = comando.data && comando.data.default_member_permissions;

        if (eComandoAdmin) {
            comandosAdmin.push(textoComando);
        } else {
            comandosNormais.push(textoComando);
        }
    });

    // Adicionar os comandos gerais ao painel
    embed.addFields({
        name: "Comandos Gerais",
        value: comandosNormais.length > 0 ? comandosNormais.join("\n") : "Nenhum comando público disponível.",
        inline: false
    });

    // Verificar se quem pediu é Administrador para mostrar a secção extra
    const esAdmin = membro.permissions.has(PermissionFlagsBits.Administrator);

    if (esAdmin) {
        embed.addFields({
            name: "⚙️ Comandos de Administração",
            value: comandosAdmin.length > 0 ? comandosAdmin.join("\n") : "Nenhum comando de admin configurado.",
            inline: false
        });
    }

    // Retorna o resultado. Se for admin, não pomos efémero no Slash para ele poder mostrar no chat se quiser
    return {
        embed: embed,
        ephemeral: !esAdmin
    };
}