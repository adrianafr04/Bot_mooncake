const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const CATORZE_DIAS = 14 * 24 * 60 * 60 * 1000;

async function limparCanal(canal) {
    let total = 0;

    while (true) {
        const mensagens = await canal.messages.fetch({ limit: 100 });
        if (mensagens.size === 0) break;

        const recentes = mensagens.filter(m => Date.now() - m.createdTimestamp < CATORZE_DIAS);
        const antigas = mensagens.filter(m => !recentes.has(m.id));

        let apagadasNestaRonda = 0;

        // Recentes: apagadas em massa (rápido)
        if (recentes.size > 0) {
            const apagadas = await canal.bulkDelete(recentes, true);
            apagadasNestaRonda += apagadas.size;
        }

        // Antigas (+14 dias): uma a uma (lento por causa do rate limit)
        for (const m of antigas.values()) {
            try {
                await m.delete();
                apagadasNestaRonda++;
            } catch (err) {
                // mensagem já apagada ou sem permissão: ignora
            }
        }

        total += apagadasNestaRonda;

        // Segurança: se nada foi apagado, para para não ficar num ciclo infinito
        if (apagadasNestaRonda === 0) break;
    }

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

    // Slash command
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

        const canal = interaction.channel;
        try {
            const total = await limparCanal(canal);
            const texto = `${total} mensagens apagadas.`;

            // O token da interação expira ao fim de 15 min; se falhar, avisa no canal
            await interaction.editReply(texto).catch(async () => {
                const aviso = await canal.send(texto);
                setTimeout(() => aviso.delete().catch(() => {}), 5000);
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply("Ocorreu um erro ao apagar as mensagens.").catch(() => {});
        }
    },

    // Prefixo (!limpar)
    async executePrefix(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("Só administradores podem usar este comando.");
        }
        if (!temPermissoesBot(message.channel)) {
            return message.reply("Preciso das permissões *Gerir Mensagens* e *Ver Histórico de Mensagens* neste canal.");
        }

        const canal = message.channel;
        try {
            await canal.send("A limpar o canal... (mensagens antigas podem demorar)");
            const total = await limparCanal(canal);
            const final = await canal.send(`${total} mensagens apagadas.`);
            setTimeout(() => final.delete().catch(() => {}), 5000);
        } catch (err) {
            console.error(err);
            canal.send("Ocorreu um erro ao apagar as mensagens.").catch(() => {});
        }
    },
};