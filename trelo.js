const axios = require('axios');

const { Client, GatewayIntentBits } = require('discord.js');

const trelloApiKey = 'YOUR_TRELLO_API_KEY';
const trelloApiToken = 'YOUR_TRELLO_API_TOKEN';
const trelloBoardId = 'YOUR_TRELLO_BOARD_ID';

const discordBotToken = '';
const discordChannelId = '1197611103576928336';

const trelloApiUrl = `https://api.trello.com/1/boards/${trelloBoardId}/actions?key=${trelloApiKey}&token=${trelloApiToken}`;

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // Add other necessary intents if needed
    ],
});

// Hàm gửi thông báo đến Discord
const sendDiscordNotification = (message) => {
    const channel = discordClient.channels.cache.get(discordChannelId);
    if (channel) {
        channel.send(message);
    }
};

// Lắng nghe sự kiện khi có thẻ được hoàn thành trên Trello
const listenForTrelloCompletion = async () => {
    try {
        const response = await axios.get(trelloApiUrl);
        console.log('Trello API Response:', response.data); // Log the Trello API response
        const actions = response.data;
        for (const action of actions) {
            if (action.type === 'updateCard' && action.data.listAfter && action.data.listAfter.name === 'Xong') {
                const cardName = action.data.card.name;
                const userName = action.memberCreator.fullName;
                const completionTime = new Date(action.date).toLocaleString(); // Convert the timestamp to a readable date/time format
                const message = `${userName} đã hoàn thành thẻ ${cardName} trên Trello vào lúc ${completionTime}! @everyone`;
                // Send the message with allowed mentions
                sendDiscordNotification(message, { allowedMentions: { parse: ['@everyone'] } });
            }
        }
    } catch (error) {
        console.error('Error listening for Trello completion:', error.message);
    }
};

// Function to set up the interval at midnight
const setupMidnightInterval = () => {
    const now = new Date();
    const timeUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

    setTimeout(() => {
        listenForTrelloCompletion(); // Initial check when the script starts
        setInterval(checkTrelloCompletion, 24 * 60 * 60 * 1000); // Repeat every 24 hours
    }, timeUntilMidnight);
};

// Kết nối đến Discord và lắng nghe sự kiện Trello
discordClient.login(discordBotToken);
discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
    setupMidnightInterval();
    // setInterval(listenForTrelloCompletion, 3000);
});
