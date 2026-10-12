const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

async function limparCanal(canal) {
    let total = 0;
    let apagadas;

    do {
        apagadas = await canal.bulkDelete(100, true);
        total += apagadas.size;
    } while (apagadas.size > 0);

    return total;
}

function temPermissoesBot(canal) {
    return canal
        .permissionsFor(canal.guild.members.me)
        .has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory]);
}

module.exports = {
    name: "limpar",
    description: "Apaga todas as mensagens do canal (apenas admins)",

    data: new SlashCommandBuilder()
        .setName("limpar")
        .setDescription("Apaga todas as mensagens do canal (apenas admins)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Só administradores podem usar este comando.", ephemeral: true });
        }
        if (!temPermissoesBot(interaction.channel)) {
            return interaction.reply({
                content: "Preciso das permissões *Gerir Mensagens* e *Ver Histórico de Mensagens* neste canal.",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });
        try {
            const total = await limparCanal(interaction.channel);
            await interaction.editReply(`🧹 ${total} mensagens apagadas.`);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Ocorreu um erro ao apagar as mensagens.");
        }
    },

    async executePrefix(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(" Só administradores podem usar este comando.");
        }
        if (!temPermissoesBot(message.channel)) {
            return message.reply(" Preciso das permissões *Gerir Mensagens* e *Ver Histórico de Mensagens* neste canal.");
        }

        try {
            const total = await limparCanal(message.channel);
            const aviso = await message.channel.send(`🧹 ${total} mensagens apagadas.`);
            setTimeout(() => aviso.delete().catch(() => {}), 5000);
        } catch (err) {
            console.error(err);
            message.channel.send(" Ocorreu um erro ao apagar as mensagens.");
        }
    },
};