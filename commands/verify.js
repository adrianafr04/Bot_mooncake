const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { enviarFormulario } = require("../verificacion");

async function enviar(client, miembro) {
    if (!miembro) return "Não encontrei esse membro no servidor.";
    if (miembro.user.bot) return "Não podes enviar a verificação a um bot.";

    const resultado = await enviarFormulario(client, miembro, { avisarCanal: false });

    if (resultado.ok) return `Formulário de verificação enviado a ${miembro.user.tag}.`;
    if (resultado.dmCerrados) return `${miembro.user.tag} tem as mensagens privadas fechadas e não recebeu o formulário.`;
    return `Ocorreu um erro ao enviar o formulário a ${miembro.user.tag}. Vê a consola.`;
}

module.exports = {
    name: "verify",
    description: "Envia o formulário de verificação a um membro (apenas admins)",

    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Envia o formulário de verificação a um membro (apenas admins)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addUserOption(opcao =>
            opcao
                .setName("membro")
                .setDescription("Membro a quem enviar a verificação")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Só administradores podem usar este comando.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("membro");
        const miembro = await interaction.guild.members.fetch(user.id).catch(() => null);

        await interaction.editReply(await enviar(client, miembro));
    },

    async executePrefix(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("Só administradores podem usar este comando.");
        }

        const id = message.mentions.users.first()?.id ?? args[0]?.replace(/\D/g, "");
        if (!id) {
            return message.reply("Uso: `!verify @membro` ou `!verify ID`.");
        }

        const miembro = await message.guild.members.fetch(id).catch(() => null);

        await message.reply(await enviar(client, miembro));
    },
};