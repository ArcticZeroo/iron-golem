const { Client } = require('iron-golem');

// Using Mineplex since it already
// has server configs available,
// so I don't need to set stuff like
// chat delay and chat patterns.
//
// If you're using another server,
// add its server config to the 
// serverConfigs option.
const minecraftClient = new Client({
    username: 'myuser',
    password: 'mypass',
    server: 'us.mineplex.com',
    prefix: 'US',
    sessionCache: true
});

function register() {
    // Restart after 2.5 seconds
    function restart() {
        setTimeout(function () {
            // There is a promise being ignored here
            // but I am currently too lazy to fix that
            minecraftClient.init();
        }, 2500);
    }
    
    minecraftClient.on('kicked', restart);
    minecraftClient.on('end', restart);
    minecraftClient.on('error', function (e) {
        if (e.toString().includes('FATAL')) {
            restart();
        }
    });

    minecraftClient.on('login', function () {
        console.log('Succesfully logged in!');
    });
    
    // Message is the event emitted by un-parsed chat
    // this event is emitted regardless of server configs
    minecraftClient.on('message', function (text, coloredText) {
        // Print the ANSI colored text
        console.log(coloredText);
    });

    // This is a custom one emitted because there is
    // a chat message regex registered for Mineplex
    minecraftClient.on('chat', function (msg) {
        console.log(`Just got a message from ${msg.sender}, who is level ${msg.level} and rank ${msg.rank} - ${msg.text}`);
    });

    minecraftClient.on('spawn', function () {
        // You can still access mineflayer if you want
        // Don't set events on mineflayer though, because
        // if the client is restarted those go poof.
        console.log(`There are ${Object.keys(minecraftClient.bot.players).length} players online.`);

        // Send chat messages through the client so that it obeys chat delay
        // This is async because it may take a while to send, because of the delay.
        // It usually won't fail.
        minecraftClient.send('Hello world!').catch(console.error);
    });
}

async function run() {
    try {
        await minecraftClient.init();
    } catch (e) {
        console.error('Client hit a fatal error while initializing: ');
        console.error(e);
        return;
    }
    
    register();
}

run().catch(console.error);