import { Client } from 'https://esm.run/revolt.js';
// https://github.com/revoltchat/revolt.js
// https://developers.revolt.chat/api/

import { Peer } from 'https://esm.run/peerjs';
// https://peerjs.com/docs

window.net4web = function (opts={}) {
  
/* ====================== OPTS ====================== 

  opts = {
    id: 'string', * undefined results in dynamic id *
    playerLimit: 64,
    peerTimeout: 3, 
    token: 'PGo5TJg0NwsP...0hK',
    channelId: '01GVQDK26H...MWVY',
    peerOpts: { https://peerjs.com/docs/#peer-options },
    revoltOpts: { https://revolt.js.org/modules/config.html }
  }
  
*/

  if (!opts.playerLimit) opts.playerLimit = 64;
  if (!opts.peerTimeout) opts.peerTimeout = 3; // seconds
  
  if (!opts.peerOpts) opts.peerOpts = {debug: opts.debug};
  if (!opts.revoltOpts) opts.revoltOpts = {debug: opts.debug};
  

/* ====================== LOG ====================== */

  
  const log = function() {
    if (opts.debug) console.log(...arguments);
  };
  
  log('4web started', opts);
  

/* ====================== EVENTS ====================== */

  
  const eventTarget = new EventTarget();
  
  const on = function (event, callback, options) {
    eventTarget.addEventListener(event, callback, options);
  };

  
/* ====================== LIST ====================== */
  
  const list = {};

  const sendDate = function (id, data, date) {
    if (!date) date = new Date().valueOf();
    const connection = list[id].connection;
    connection.send({ data, date });
  }; 

  const broadcast = function (data, date) {
    if (!date) date = new Date().valueOf();
    for (let id in list) {
      sendDate(id, data, date);
    }
  };
    
  const numberOfPlayers = function () {
    return Object.keys(list).length;
  };

/* ====================== PEER CONNECTIONS ====================== */

  
  const peer = new Peer(opts.id, opts.peer);
  
  const connectionOpen = function (id, connection) {
    log('connection established', connection);
    list[id].lastDate = new Date().valueOf();
    const send = function (data) { sendDate(id, data) };
    eventTarget.dispatchEvent(new CustomEvent('connection', {
      detail: { id, send, connection, connectionDate: list[id]?.connectionDate }
    }));
  };

  const connectionData = function (id, content, connection) {
    log('received data', content, connection);
    list[id].lastDate = content.date;
    const send = function (data) { sendDate(id, data) };
    eventTarget.dispatchEvent(new CustomEvent('data', {
      detail: { id, send, content, connection, connectionDate: list[id]?.connectionDate }
    }));
  };

  const connectionClose = function (id, connection) {
    log('connection closed', connection);
    eventTarget.dispatchEvent(new CustomEvent('left', {
      detail: { id, connection, connectionDate: list[id]?.connectionDate }
    }));
    delete list[id];
  };

  const connectionError = function (id, error, connection) {
    log('connection error', error, connection);
    eventTarget.dispatchEvent(new CustomEvent('error', {
      detail: { id, error, connection, connectionDate: list[id]?.connectionDate }
    }));
  };
  
  const addConnectionEvents = function (id, connection) {
    connection.on('open', function () { connectionOpen(id, connection) });
    connection.on('data', function (data) { connectionData(id, data, connection) });    
    connection.on('close', function () { connectionClose(id, connection) });    
    connection.on('error', function (error) { connectionError(id, error, connection) });
  };

  
/* ====================== PEER EVENTS ====================== */
  
  peer.on('open', function (id) {
    log('peer network open', id);
    eventTarget.dispatchEvent(new CustomEvent('open', {
      detail: { id }
    }));
    client.loginBot(opts.token);
  });

  peer.on('close', function () {
    log('peer closed')
    eventTarget.dispatchEvent(new CustomEvent('close'), {
      detail: { peer }
    });
  });
  
  peer.on('disconnect', function () {
    log('peer disconnect')
    eventTarget.dispatchEvent(new CustomEvent('disconnect'), {
      detail: { peer }
    });
    peer.reconnect();
  });
  
  peer.on('error', function (err) {
    log('peer error', err)
    eventTarget.dispatchEvent(new CustomEvent('error'), {
      detail: { err, peer }
    });
  });

  peer.on('connection', function (connection) {
    log('receiving connection', connection);
    
    var newId = connection.peer;
    list[newId] = { id: newId, connection, connectionDate: new Date().valueOf() };
    
    connection.on('open', function () {
      log('request connection open', connection);
      const send = function (data) { sendDate(newId, data) };
      eventTarget.dispatchEvent(new CustomEvent('request', {
        detail: { id: newId, send, connection, connectionDate: list[newId].connectionDate } 
      }));
    });
    
    addConnectionEvents(newId, connection);

  });


/* ====================== CLIENT BOT ====================== */

  
  const client = new Client();

  const getMessages = async function (channel) {
    let messages = await client.api.get('/channels/'+channel+'/messages');
    return messages;
  };

  const parseMessages = function (messages) {
    const parsed = { players: {}, rooms: {} };
    const slicedMessages = messages.slice(-64 || -opts.playerLimit);
    
    slicedMessages.forEach(message => {
      const contentList = message.content.split(' ');
      const messageType = contentList[0];
      const state = contentList[1];
      const id = contentList[2];
      const botId = client.user._id;
      if (message.author == botId) {
        if (messageType == 'player' && id !== peer.id) parsed.players[id] = state;
        if (messageType == 'room') parsed.rooms[id] = state;
      }
    });
    
    const data = { players: [], rooms: [] };
    for (let id in parsed.players ) {
      if (parsed.players[id] == 'joined') data.players.push(id);
    }
    for (let id in parsed.rooms ) {
      if (parsed.rooms[id] == 'created') data.rooms.push(id);
    }
    
    return data;
  };

  const parseMessage = function (message) {
    const contentList = message.content.split(' ');
    const messageType = contentList[0];
    const state = contentList[1];
    const id = contentList[2];
    const botId = client.user._id;
    if (message.author._id == botId) {
      if (messageType == 'player' && id !== peer.id) {
        return { id, messageType, state, connectionDate: list[id]?.connectionDate };
      } 
      if (messageType == 'room') {
        return { id, messageType, state };
      }
    }
  };
  
  const getChannelData = async function () {
    const messages = await getMessages(opts.channelId);
    const channelData = parseMessages(messages);
    return channelData;
  };

  const sendMessage = function (message) {
    client.api.post('/channels/'+opts.channelId+'/messages', {
      content: message
    });
  };


/* ====================== CLIENT EVENTS ====================== */

  
  client.on('ready', function () {
    log('client ready', client);
  
    sendMessage('player joined ' + peer.id);
    
    eventTarget.dispatchEvent(new CustomEvent('ready', { 
      detail: { id: peer.id, loginDate: new Date().valueOf() }
    }));
  });
  
  client.on('message', function (message) {
    log('message', message);
    
    var messageData = parseMessage(message);
    
    eventTarget.dispatchEvent(new CustomEvent('message', {
      detail: { message, messageData }
    }));
    
    if (messageData && 
        messageData.messageType == 'player' && 
        messageData.state == 'joined') {
      
      log('player joined', messageData);
      
      var joinedId = messageData.id;
      var connection = peer.connect(joinedId);
      list[joinedId] = { id: joinedId, connection, connectionDate: new Date().valueOf() };

      connection.on('open', function () {
        log('connected to join', connection);
        const send = function (data) { sendDate(joinedId, data) };
        eventTarget.dispatchEvent(new CustomEvent('join', {
          detail: { id: joinedId, send, connection, connectionDate: list[joinedId].connectionDate } 
        }));
      });
      
      addConnectionEvents(joinedId, connection);
      
    } // close player joined 
    
  }); // close on message 

  client.on('error', function (err) {
    log('client error', err)
    eventTarget.dispatchEvent(new CustomEvent('error'), {
      detail: { err, client }
    });
  });


/* ====================== RETURN ====================== */
  
  return {
    on: on,
    list: list,
    client: client,
    sendMessage: sendMessage,
    getMessages: getMessages,
    parseMessage: parseMessage,
    getChannelData: getChannelData,
    peer: peer,
    id: peer.id,
    broadcast: broadcast,
    numberOfPlayers: numberOfPlayers,
    connect: peer.connect,
    disconnect: peer.disconnect,
    reconnect: peer.reconnect,
    destroy: peer.destroy
  }
  
}


