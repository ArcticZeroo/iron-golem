module.exports = [
    {
        server: /\.?mineplex\.com$/i,
        name: 'Mineplex',
        version: '1.8',
        chat: [
            {
                name: 'server-message',
                regex: /^(.+?)> (.+)$/,
                matches: ['fullText', 'prefix', 'text']
            },
            {
                name: 'chat',
                // What in god's name have I done
                regex: /^(\d{1,3})\s+(?:([A-Z.]{1,12})\s+)?(\$|[A-Za-z0-9_]{1,16})\s+(.+)$/,
                matches: ['fullText', 'level', 'rank', 'sender', 'text'],
                replyFormatter:  (text, sender) => `${sender}: ${text}`
            },
            {
                name: 'private-message',
                regex: /^(\$|[A-Za-z0-9_]{1,16}) > (\$|[A-Za-z0-9_]{1,16}) (.+)$/,
                matches: ['fullText', 'sender', 'target', 'text'],
                replyFormatter:  (text, sender) => `/m ${sender} ${text}`
            },
            {
                name: 'staff-message-receive',
                regex: /^<- ([A-Za-z.]{1,16}) (\$|[A-Za-z0-9_]{1,16}) (.+)$/,
                matches: ['fullText', 'rank', 'sender', 'text'],
                replyFormatter:  (text, sender) => `/ma ${sender}: ${text}`
            },
            {
                name: 'staff-message-send',
                regex: /^-> ([A-Za-z.]{1,16}) (\$|[A-Za-z0-9_]{1,16}) (.+)$/,
                matches: ['fullText', 'rank', 'target', 'text'],
                replyFormatter:  (text, sender) => `/ma ${sender} ${text}`
            },
            {
                name: 'staff-chat',
                regex: /^([A-Za-z.]+) (\$|[A-Za-z0-9_]{1,16}) (.+)$/,
                matches: ['fullText', 'rank', 'sender', 'text'],
                replyFormatter:  (text, sender) => `/a ${sender}: ${text}`
            }
        ]
    }
];