module.exports = {
    name: "ping",
    description: "Latência do bot e API do discord",
    async execute(message, args, client) {
        const m = await message.channel.send("Ping?");
        const latenciaLocal = m.createdTimestamp - message.createdTimestamp;
        const latenciaAPI = Math.round(client.ws.ping);
        await m.edit(`Olá! \nEstou online, Latência é de **${latenciaLocal}ms**. Latência da API é de **${latenciaAPI}ms**.`);
    }
};