const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const CATORZE_DIAS = 14 * 24 * 60 * 60 * 1000;

async function limparCanal(canal, limite = Infinity) {
    let total = 0;
    let falhas = 0;
    let analisadas = 0;
    let antes;

    while (analisadas < limite) {
        const opcoes = { limit: Math.min(100, limite - analisadas) };
        if (antes) opcoes.before = antes;

        const mensagens = await canal.messages.fetch(opcoes);
        if (mensagens.size === 0) break;

        analisadas += mensagens.size;
        antes = mensagens.last().id;

        const recentes = mensagens.filter(m => Date.now() - m.createdTimestamp < CATORZE_DIAS);
        const antigas = mensagens.filter(m => !recentes.has(m.id));

        // Recentes: apagadas em massa
        if (recentes.size > 0) {
            try {
                const apagadas = await canal.bulkDelete(recentes, true);
                total += apagadas.size;
            } catch (err) {
                console.error(`[limpar] bulkDelete falhou (código ${err.code}):`, err.message);
            }
        }

        // Antigas (+14 dias): uma a uma
        for (const m of antigas.values()) {
            try {
                await m.delete();
                total++;
            } catch (err) {
                falhas++;
                console.error(`[limpar] Falhou ${m.id} (código ${err.code}):`, err.message);
            }
        }
    }

    console.log(`[limpar] Fim. Apagadas: ${total} | Falhas: ${falhas}`);
    return total;
}

function temPermissoesBot(canal) {
    return canal
        .permissionsFor(canal.guild.members.me)
        .has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory]);
}

module.exports = {
    name: "limpar",
    description: "Apaga mensagens do canal. Usa um número para limitar (apenas admins)",

    data: new SlashCommandBuilder()
        .setName("limpar")
        .setDescription("Apaga mensagens do canal. Usa um número para limitar (apenas admins)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addIntegerOption(opcao =>
            opcao
                .setName("quantidade")
                .setDescription("Quantas mensagens apagar (vazio = todas)")
                .setMinValue(1)
        ),

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

        const limite = interaction.options.getInteger("quantidade") ?? Infinity;

        await interaction.deferReply({ ephemeral: true });

        const canal = interaction.channel;
        try {
            const total = await limparCanal(canal, limite);
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

    // Prefixo (!limpar ou !limpar 50)
    async executePrefix(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("Só administradores podem usar este comando.");
        }
        if (!temPermissoesBot(message.channel)) {
            return message.reply("Preciso das permissões *Gerir Mensagens* e *Ver Histórico de Mensagens* neste canal.");
        }

        // Sem número = apaga tudo
        let limite = Infinity;
        if (args[0]) {
            limite = parseInt(args[0], 10);
            if (isNaN(limite) || limite < 1) {
                return message.reply("Uso: `!limpar` (apaga tudo) ou `!limpar 50` (apaga 50 mensagens).");
            }
        }

        const canal = message.channel;
        try {
            await canal.send("A limpar o canal... (mensagens antigas podem demorar)");
            const total = await limparCanal(canal, limite);
            const final = await canal.send(`${total} mensagens apagadas.`);
            setTimeout(() => final.delete().catch(() => {}), 5000);
        } catch (err) {
            console.error(err);
            canal.send("Ocorreu um erro ao apagar as mensagens.").catch(() => {});
        }
    },
};