const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ChannelSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType
} = require('discord.js');

module.exports = {
    name: "mensagem",
    description: "Envia uma mensagem personalizada para um determinado canal",
    permissions: [PermissionFlagsBits.Administrator], // apenas para administradores

    data: new SlashCommandBuilder()
        .setName('mensagem')
        .setDescription('Envia uma mensagem personalizada para um determinado canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Bloqueia o comando para administradores

    async execute(interaction, client) {
        // Criar o Embed bonito inicial
        const embed = new EmbedBuilder()
            .setTitle("Escreva uma mensagem")
            .setDescription("Selecione o canal de destino no menu abaixo. Após a seleção, abrir-se-á uma janela para escrever o conteúdo da mensagem.")
            .setColor('#4e094b') // Roxo defaut
            .setTimestamp() // Adiciona a hora atual no fundo
            .setFooter({ 
                text: `Solicitado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // Menu de seleção que lista automaticamente os canais de texto do servidor
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('selecionar_canal_embed')
            .setPlaceholder('Escolha o canal de destino...')
            .addChannelTypes(ChannelType.GuildText); // apenas canais de texto 

        const row = new ActionRowBuilder().addComponents(selectMenu);

        try {
            // Envia o painel inicial com o menu para o utilizador e guarda a resposta na variavel
            const respostaPainel = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

            // Invoca a funcao que vai gerir a escolha do canal e a criacao do texto personalizado
            gerenciarFluxoMensagem(respostaPainel, interaction.user.id, interaction);

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Ocorreu um erro ao tentar abrir o painel.', 
                ephemeral: true 
            });
        }
    },

    async executePrefix(message, args, client) {
        // Verificar se e Adminstrador no prefixo
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("Este comando e exclusivo para Administradores do servidor!");
        }

        // Criar o Embed bonito inicial
        const embed = new EmbedBuilder()
            .setTitle("Escreva uma mensagem")
            .setDescription("Selecione o canal de destino no menu abaixo. Após a seleção, abrir-se-á uma janela para escrever o conteúdo da mensagem.")
            .setColor('#4e094b') // Roxo defaut
            .setTimestamp() // Adiciona a hora atual no fundo
            .setFooter({ 
                text: `Solicitado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        // Menu de seleção que lista automaticamente os canais de texto do servidor
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('selecionar_canal_embed')
            .setPlaceholder('Escolha o canal de destino...')
            .addChannelTypes(ChannelType.GuildText); // apenas canais de texto 

        const row = new ActionRowBuilder().addComponents(selectMenu);

        try {
            // Envia o painel inicial com o menu para o utilizador e guarda a resposta na variavel
            const respostaPainel = await message.reply({ embeds: [embed], components: [row] });

            // Invoca a funcao que vai gerir a escolha do canal e a criacao do texto personalizado
            gerenciarFluxoMensagem(respostaPainel, message.author.id, message);

        } catch (error) {
            console.error(error);
            await message.reply('Ocorreu um erro ao tentar abrir o painel.');
        }
    }
};

// Funcao isolada para controlar os coletores tanto para slash commands quanto para prefixo
async function gerenciarFluxoMensagem(mensagemPainel, autorId, contextoOriginal) {
    // Cria um coletor de componentes focado apenas no menu de selecao, valido por 5 minutos
    const coletorMenu = mensagemPainel.createMessageComponentCollector({
        componentType: ComponentType.ChannelSelect,
        time: 300000
    });

    // Evento disparado quando o utilizador seleciona o canal no menu
    coletorMenu.on('collect', async (interacaoMenu) => {
        // Bloqueia interacoes de outros utilizadores intrusos
        if (interacaoMenu.user.id !== autorId) {
            return interacaoMenu.reply({ content: 'Voce nao iniciou este comando.', ephemeral: true });
        }

        // Guarda o ID do canal que foi selecionado pelo administrador
        const canalSelecionadoId = interacaoMenu.values[0];

        // Instancia a janela pop-up (Modal) para escrita da mensagem
        const modalContudo = new ModalBuilder()
            .setCustomId('janela_texto_embed')
            .setTitle('Conteudo do Embed');

        // Cria o campo de texto grande para digitar a mensagem personalizada
        const campoTexto = new TextInputBuilder()
            .setCustomId('texto_inserido_usuario')
            .setLabel('O que deseja exibir no Embed?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Escreva o texto aqui...')
            .setRequired(true);

        // Insere o campo de texto em uma linha de componente obrigatoria do modal
        const linhaModal = new ActionRowBuilder().addComponents(campoTexto);
        modalContudo.addComponents(linhaModal);

        // Exibe a janela pop-up na tela do utilizador
        await interacaoMenu.showModal(modalContudo);

        // Aguarda a submissao da janela pop-up com limite de 5 minutos
        interacaoMenu.awaitModalSubmit({ time: 300000 })
            .then(async (interacaoModal) => {
                // Captura o conteudo digitado no campo de texto pelo administrador
                const textoFinal = interacaoModal.fields.getTextInputValue('texto_inserido_usuario');

                // Busca a estrutura do canal dentro do cache do servidor
                const canalDestino = interacaoModal.guild.channels.cache.get(canalSelecionadoId);

                // Instancia o novo Embed totalmente customizado baseado nas preferencias do utilizador
                const embedPersonalizado = new EmbedBuilder()
                    .setTitle("Mensagem Importante")
                    .setDescription(textoFinal)
                    .setColor('#4e094b')
                    .setTimestamp();

                // Caso o canal exista validamente, realiza o disparo do embed para ele
                if (canalDestino) {
                    await canalDestino.send({ embeds: [embedPersonalizado] });
                }

                // Cria o Embed de conclusao para modificar o painel inicial enviado
                const embedSucesso = new EmbedBuilder()
                    .setTitle("Painel Atualizado")
                    .setDescription(`O embed foi enviado com sucesso para o canal <#${canalSelecionadoId}>.`)
                    .setColor('#760da7');

                // Edita a mensagem do painel que estava no canal removendo o menu e alterando o embed para o de sucesso
                if (contextoOriginal.editReply) {
                    // Atualiza caso o comando de origem tenha sido um Slash Command ephemerio
                    await contextoOriginal.editReply({ embeds: [embedSucesso], components: [] });
                } else {
                    // Atualiza caso o comando de origem tenha sido por prefixo normal
                    await mensagemPainel.edit({ embeds: [embedSucesso], components: [] });
                }

                // Responde a interacao do modal para evitar que o Discord exiba erro de falha no carregamento
                await interacaoModal.reply({ content: 'Processo terminado.', ephemeral: true }).then(() => interacaoModal.deleteReply().catch(() => {}));
            })
            .catch((erro) => {
                // Trata possiveis estouros de tempo limite do preenchimento da janela
                console.error('O tempo limite para preencher o modal expirou ou ocorreu um erro:', erro);
            });
    });
}