const io = require('socket.io-client');
const axios = require('axios');
const constants = require('./constants.json');
const config = require('./config.json');
const Actions = require('./Socket/Actions.js');
const _ = require("underscore");

axios.defaults.headers.common['Authorization'] = `Bearer ${config.empire.api_key}`;

async function initSocket() {

    console.log("Connecting to websocket...");

    try {
        let wasConnected = false;
        const userData = (await axios.get(`https://${constants.empire.domain}/api/v2/metadata/socket`)).data;

        const socket = io(
            constants.empire.socketEndpoint,
            {
                transports: ["websocket"],
                path: "/s/",
                secure: true,
                rejectUnauthorized: false,
                reconnect: true,
                extraHeaders: { 'User-agent': `${userData.user.id} API Bot` }
            }
        );

        socket.on('connect', async () => {
            console.log(`Connected to websocket`);
            if (wasConnected) {
                console.log("Closing script");
                process.exit()
            } else {
                wasConnected = true;
            }

            socket.on('init', (data) => {
                if (data && data.authenticated) {
                    console.log(`Successfully authenticated as ${data.name} id: ${data.id}`);
                    socket.emit('filters', {
                        price_max: 9999999
                    });
                } else {
                    socket.emit('identify', {
                        uid: userData.user.id,
                        model: userData.user,
                        authorizationToken: userData.socket_token,
                        signature: userData.socket_signature
                    });
                }
            })

            _.each(Object.keys(Actions), (key) => {
                socket.on(key, (data) => {
                    switch (key) {
                        case "auction_update":
                            Actions[key](data, userData)
                            break;
                        default:
                            Actions[key](data);
                            break;
                    }

                });
            });

            socket.on("disconnect", (reason) => console.log(`Socket disconnected: ${reason}`));
        });

        socket.on("close", (reason) => console.log(`Socket closed: ${reason}`));
        socket.on('error', (data) => console.log(`WS Error: ${data}`));
        socket.on('connect_error', (data) => console.log(`Connect Error: ${data}`));
    } catch (e) {
        console.log(`Error while initializing the Socket. Error: ${e}`);
    }
}

initSocket();