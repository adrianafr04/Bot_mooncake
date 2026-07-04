const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (interaction.isChannelSelectMenu() && interaction.customId === 'selecionar_canal_embed') {
            const canalId = interaction.values[0];

            // Cria o Modal (Janela Pop-up)
            const modal = new ModalBuilder()
                .setCustomId(`modal_mensagem_${canalId}`) 
                .setTitle('Escrever Mensagem do Embed');

            const tituloInput = new TextInputBuilder()
                .setCustomId('modal_titulo')
                .setLabel('Título do Embed')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Escreve o título principal aqui...')
                .setRequired(true);

            const descricaoInput = new TextInputBuilder()
                .setCustomId('modal_descricao')
                .setLabel('Descrição / Conteúdo')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Escreve o conteúdo do embed aqui...')
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(tituloInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descricaoInput);
            
            modal.addComponents(firstActionRow, secondActionRow);

            // Abre a janela para o utilizador
            await interaction.showModal(modal);
        }

      
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_mensagem_')) {
            // Extrai o ID do canal que guardámos no CustomID
            const canalId = interaction.customId.split('_')[2];
            const canalDestino = interaction.guild.channels.cache.get(canalId);

            if (!canalDestino) {
                return interaction.reply({ content: ' Não consegui encontrar o canal selecionado!', ephemeral: true });
            }

            const titulo = interaction.fields.getTextInputValue('modal_titulo');
            const descricao = interaction.fields.getTextInputValue('modal_descricao');

            // Constrói o Embed final que será enviado para o canal alvo
            const embedFinal = new EmbedBuilder()
                .setTitle(titulo)
                .setDescription(descricao)
                .setColor('#4e094b')
                .setTimestamp()
                .setFooter({ 
                    text: `Enviado por ${interaction.user.username}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            try {
                await canalDestino.send({ embeds: [embedFinal] });
                await interaction.reply({ content: `Mensagem enviada com sucesso para o canal ${canalDestino}!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: ' Erro ao enviar a mensagem. Garante que tenho permissões para ver e falar nesse canal.', ephemeral: true });
            }
        }
    },
};