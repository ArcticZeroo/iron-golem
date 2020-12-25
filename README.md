# iron-golem

A robust Minecraft bot + lib built upon mineflayer

Find this module on [npm](https://npmjs.org/package/mineflayer).

## Usage

Once you've actually installed `iron-golem`, it's pretty simple to get started.

```javascript
const { Client } = require('iron-golem');

const client = new Client({
    username: 'myuser',
    password: 'mypass',
    server: 'ip',
    port: 'port',
    // other settings here,
    // look inside client.ts
    // for all the possible settings
    // (or by the time you read this I
    // might actually have some jsdocs)
});

// this is async (returns a promise)
// but we'll ignore that for now
client.init();

// do stuff with your client here
```

It's pretty easy as you can see. Depending on your use case, you'll probably also want some server-specific functionality without having to bend over backwards. That's pretty easy to do.

Inside the client settings, add an option called `serverConfigs`, which is an Array.

```javascript
new Client({serverConfigs: []})
```

A server config is a key/value object which has any of the following properties:

* `server`, which is a regular expression used to match the server ip (not port) so the client knows which pattern(s) to use
* `name`, readable name for the server
* `version`, the number version to use (for example, `1.8` is the one used for Mineplex)
* `chatDelay`, pretty obvious. In ms. This is 1200 for Mineplex, try something similar for most big servers.
* `chat`, which is an array of more objects you can use to automatically parse chat. If you are using chat parsing, events will be emitted from the client whose name equals the name of the chat object. Try not to use existing event names (like "spawn"), because eventually you'll run into some unexpected behavior.
    * Each chat object should have a `name` (readable name), `regex` (the regex used to match this chat type), 
    * and an array called `matches` which contains strings that are used to name each match. This is probably pretty confusing, but here's an example:
        * If your regex is `/^I have a (dog|cat|bird)$/`, and you want to store what kind of animal the person has, your matches would look like `['fullText', 'animal']`. fullText would be the first because regular expression matching in JS always has the index 0 equal to the fully matched text. Next, animal is the name of the first match group. The resulting object created from this chat (a `MinecraftMessage`) will now have the property "animal", so you can use `msg.animal` and it will have a value.
    * additionally, you can have a `replyFormatter` function which takes `(text, sender)` and returns a string that is used to format a reply chat message. 
    
