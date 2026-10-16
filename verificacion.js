const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits,
} = require("discord.js");
const configDados = require("./config.json");

const COR = "#a817c5";
const CAMPO_NOMBRE = "Nombre en GTA";
const CAMPO_FORO = "Perfil del foro";
const CAMPO_MENSAJE = "Mensaje";

function obtenerCampo(embed, nombre) {
    return embed.fields.find((f) => f.name === nombre)?.value;
}

async function enviarFormulario(client, member, { avisarCanal = true } = {}) {
    const embed = new EmbedBuilder()
        .setColor(COR)
        .setTitle(`Bienvenido/a a ${member.guild.name}`)
        .setDescription(
            "Para acceder al servidor necesitas completar tu registro.\n\n" +
            "Pulsa el botón de abajo e indica:\n" +
            "**1.** El nombre de tu personaje en GTA.\n" +
            "**2.** El enlace de tu perfil en el foro.\n" +
            "**3.** Un mensaje (opcional) si tienes algún problema.\n\n" +
            "Cuando envíes los datos, los administradores los revisarán."
        )
        .setThumbnail(member.guild.iconURL())
        .setTimestamp();

    const fila = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`ver_abrir_${member.guild.id}`)
            .setLabel("Completar y enviar datos")
            .setStyle(ButtonStyle.Primary)
    );

    try {
        await member.send({ embeds: [embed], components: [fila] });
        return { ok: true };
    } catch (err) {
        console.error(`[verificacion] Não consegui enviar DM a ${member.user.tag} (código ${err.code}):`, err.message);

        // 50007 = o utilizador tem as mensagens privadas fechadas
        const dmCerrados = err.code === 50007;

        if (avisarCanal) {
            const canal = await client.channels.fetch(configDados.canalVerificacion).catch(() => null);
            if (canal) {
                const aviso = new EmbedBuilder()
                    .setColor("#e67e22")
                    .setTitle("No se pudo enviar el mensaje de registro")
                    .setDescription(
                        dmCerrados
                            ? `<@${member.id}> (${member.user.tag}) ha entrado al servidor, pero tiene los mensajes privados cerrados, así que no ha recibido el formulario.`
                            : `<@${member.id}> (${member.user.tag}) ha entrado al servidor, pero ocurrió un error al enviarle el formulario.`
                    )
                    .addFields({
                        name: "Qué hacer",
                        value:
                            "Pídele que active los mensajes privados del servidor (Ajustes del servidor > Privacidad > Mensajes directos) " +
                            "y usa /verify o !verify para reenviarle el formulario.",
                    })
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: `ID: ${member.id}` })
                    .setTimestamp();

                await canal.send({ embeds: [aviso] }).catch((e) =>
                    console.error("[verificacion] Não consegui enviar o aviso ao canal:", e.message)
                );
            }
        }

        return { ok: false, dmCerrados };
    }
}

module.exports = (client) => {
    // 1. Mensagem privada quando alguém entra
    client.on("guildMemberAdd", async (member) => {
        if (member.user.bot) return;
        await enviarFormulario(client, member);
    });

    // 2. Botões e formulários
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;
        if (!interaction.customId.startsWith("ver_")) return;

        const [, accion, id] = interaction.customId.split("_");

        try {
            // ---------- Utilizador: abrir formulário ----------
            if (interaction.isButton() && accion === "abrir") {
                const modal = new ModalBuilder()
                    .setCustomId(`ver_enviar_${id}`)
                    .setTitle("Registro de ingreso");

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("nombre")
                            .setLabel("Nombre de tu personaje en GTA")
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(32)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("foro")
                            .setLabel("Enlace de tu perfil en el foro")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("https://...")
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("mensaje")
                            .setLabel("¿Tienes algún problema? Cuéntanoslo")
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(500)
                            .setRequired(false)
                    )
                );

                return interaction.showModal(modal);
            }

            // ---------- Utilizador: enviar formulário ----------
            if (interaction.isModalSubmit() && accion === "enviar") {
                const nombre = interaction.fields.getTextInputValue("nombre").trim();
                const foro = interaction.fields.getTextInputValue("foro").trim();
                const mensaje = interaction.fields.getTextInputValue("mensaje").trim();

                if (!/^https?:\/\/\S+$/i.test(foro)) {
                    return interaction.reply({
                        content: "El enlace del foro no es válido. Debe empezar por http:// o https://. Pulsa el botón e inténtalo de nuevo.",
                    });
                }

                const canal = await client.channels.fetch(configDados.canalVerificacion).catch(() => null);
                if (!canal) {
                    console.error("[verificacion] Canal de verificação não encontrado. Verifica 'canalVerificacion' no config.json.");
                    return interaction.reply({
                        content: "Ha ocurrido un error al enviar tus datos. Avisa a un administrador.",
                    });
                }

                const embedAdmin = new EmbedBuilder()
                    .setColor(COR)
                    .setTitle("Nueva solicitud de ingreso")
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: "Usuario", value: `<@${interaction.user.id}> (${interaction.user.tag})` },
                        { name: CAMPO_NOMBRE, value: nombre },
                        { name: CAMPO_FORO, value: foro },
                        { name: CAMPO_MENSAJE, value: mensaje || "Sin mensaje" },
                        { name: "Estado", value: "Pendiente" }
                    )
                    .setFooter({ text: `ID: ${interaction.user.id}` })
                    .setTimestamp();

                const botones = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ver_aceptar_${interaction.user.id}`)
                        .setLabel("Aceptar")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`ver_editar_${interaction.user.id}`)
                        .setLabel("Cambiar nombre")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`ver_expulsar_${interaction.user.id}`)
                        .setLabel("Expulsar")
                        .setStyle(ButtonStyle.Danger)
                );

                await canal.send({ embeds: [embedAdmin], components: [botones] });

                // Remove o botão da mensagem original para não enviar duas vezes
                await interaction.update({ components: [] });

                // Segunda mensagem: confirmação
                const confirmacion = new EmbedBuilder()
                    .setColor("#2ecc71")
                    .setTitle("Datos enviados")
                    .setDescription(
                        "Tus datos se han enviado correctamente y serán analizados por los administradores del servidor.\n" +
                        "Te avisaremos cuando se tome una decisión."
                    )
                    .setTimestamp();

                return interaction.followUp({ embeds: [confirmacion] });
            }

            // ---------- Admins: a partir daqui ----------
            if (!interaction.inGuild()) return;

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "Solo los administradores pueden usar estos botones.", ephemeral: true });
            }

            // Botão: abrir formulário para alterar o nome
            if (interaction.isButton() && accion === "editar") {
                const nombreActual = obtenerCampo(interaction.message.embeds[0], CAMPO_NOMBRE) ?? "";

                const modal = new ModalBuilder()
                    .setCustomId(`ver_nombre_${id}`)
                    .setTitle("Cambiar nombre");

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("nombre")
                            .setLabel("Nuevo nombre")
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(32)
                            .setValue(nombreActual.slice(0, 32))
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }

            // Formulário: guardar o novo nome no embed
            if (interaction.isModalSubmit() && accion === "nombre") {
                const nuevo = interaction.fields.getTextInputValue("nombre").trim();

                const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                embed.setFields(
                    embed.data.fields.map((f) => (f.name === CAMPO_NOMBRE ? { ...f, value: nuevo } : f))
                );

                return interaction.update({ embeds: [embed] });
            }

            // Botão: aceitar
            if (interaction.isButton() && accion === "aceptar") {
                await interaction.deferUpdate();

                const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                const nombre = obtenerCampo(interaction.message.embeds[0], CAMPO_NOMBRE);

                const miembro = await interaction.guild.members.fetch(id).catch(() => null);
                if (!miembro) {
                    return interaction.followUp({ content: "Este usuario ya no está en el servidor.", ephemeral: true });
                }

                try {
                    await miembro.setNickname(nombre, `Aceptado por ${interaction.user.tag}`);

                    // Opcional: dar um cargo ao aceitar (config.json -> "rolAceptado")
                    if (configDados.rolAceptado) {
                        await miembro.roles.add(configDados.rolAceptado);
                    }
                } catch (err) {
                    console.error("[verificacion] Erro ao aceitar:", err);
                    return interaction.followUp({
                        content: "No pude cambiar el apodo o asignar el rol. Revisa que mi rol esté por encima del suyo y que tenga los permisos necesarios.",
                        ephemeral: true,
                    });
                }

                embed.setColor("#2ecc71").setFields(
                    embed.data.fields.map((f) =>
                        f.name === "Estado" ? { ...f, value: `Aceptado por <@${interaction.user.id}>` } : f
                    )
                );

                await interaction.editReply({ embeds: [embed], components: [] });

                const aviso = new EmbedBuilder()
                    .setColor("#2ecc71")
                    .setTitle("Solicitud aceptada")
                    .setDescription(`Has sido aceptado/a en **${interaction.guild.name}**. Tu apodo ahora es **${nombre}**.`);
                return miembro.send({ embeds: [aviso] }).catch(() => {});
            }

            // Botão: expulsar
            if (interaction.isButton() && accion === "expulsar") {
                await interaction.deferUpdate();

                const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                const miembro = await interaction.guild.members.fetch(id).catch(() => null);

                if (miembro) {
                    try {
                        await miembro.kick(`Solicitud rechazada por ${interaction.user.tag}`);
                    } catch (err) {
                        console.error("[verificacion] Erro ao expulsar:", err);
                        return interaction.followUp({
                            content: "No pude expulsar a este usuario. Revisa mis permisos y la posición de mi rol.",
                            ephemeral: true,
                        });
                    }
                }

                embed.setColor("#e74c3c").setFields(
                    embed.data.fields.map((f) =>
                        f.name === "Estado" ? { ...f, value: `Expulsado por <@${interaction.user.id}>` } : f
                    )
                );

                return interaction.editReply({ embeds: [embed], components: [] });
            }
        } catch (err) {
            console.error("[verificacion] Erro:", err);
            const msg = { content: "Ha ocurrido un error inesperado.", ephemeral: true };
            if (interaction.deferred || interaction.replied) interaction.followUp(msg).catch(() => {});
            else interaction.reply(msg).catch(() => {});
        }
    });
};

module.exports.enviarFormulario = enviarFormulario;