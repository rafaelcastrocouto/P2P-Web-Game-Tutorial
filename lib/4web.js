import { Client } from 'https://esm.run/revolt.js';
// https://github.com/revoltchat/revolt.js
// https://developers.revolt.chat/api/

import { Peer } from 'https://esm.run/peerjs';
// https://peerjs.com/docs

window.net4web = function (opts={}) {
  
  const log = function() {
    if (opts.debug) console.log(...arguments);
  };
  
  /*  opts {
    id: *dynamic*,
    messageLimit: 64,
    token: 'PGo5TJg0NwsPy03UjV-S8V9r5NfDJQiri6oYqcvh_eitIvOu9_Sx3DP1F1hS50hK',
    channelId: '01GVQDK26HWZQ8KKJ78C1AMWVY',
    peerOpts: { https://peerjs.com/docs/#peer-options },
    revoltOpts: { https://revolt.js.org/modules/config.html }
  } */

  const client = new Client(opts.revoltOpts);
  const token = opts.token || 'PGo5TJg0NwsPy03UjV-S8V9r5NfDJQiri6oYqcvh_eitIvOu9_Sx3DP1F1hS50hK';
  const channelId = opts.channelId || '01GVQDK26HWZQ8KKJ78C1AMWVY';
  
  opts.peerOpts = opts;
  opts.revoltOpts = opts;
  opts.revoltOpts.token = token;
  opts.revoltOpts.channelId = channelId;
  
  log('4web started', opts);

  const eventTarget = new EventTarget();
  
  const on = function (event, callback, options) {
    eventTarget.addEventListener(event, callback, options);
  };
  
  const peer = new Peer(opts.id, opts.peerOpts);
  
  peer.on('open', function (id) {
    log('peer network open', id);
    
    eventTarget.dispatchEvent(new CustomEvent('open', {
      detail: { id }
    }));
    
    client.loginBot(token);
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

    connection.on('open', function () {
      log('request connection open', connection);
      eventTarget.dispatchEvent(new CustomEvent('request', {
        detail: { newId, connection } 
      }));
    });
    
    addConnectionEvents(newId, connection);

  });
  
  const connectionOpen = function (id, connection) {
    log('connection established', connection);
    eventTarget.dispatchEvent(new CustomEvent('connection', {
      detail: { id, connection } 
    }));
  };

  const connectionData = function (id, data, connection) {
    log('received data', data, connection);
    eventTarget.dispatchEvent(new CustomEvent('data', {
      detail: { id, data, connection }
    }));
  };

  const connectionClose = function (id, connection) {
    log('connection closed', connection);
    eventTarget.dispatchEvent(new CustomEvent('left', {
      detail: { id, connection }
    }));
  };

  const connectionError = function (id, error, connection) {
    log('connection error', error, connection);
    eventTarget.dispatchEvent(new CustomEvent('error', {
      detail: { id, error, connection }
    }));
  };
  
  const addConnectionEvents = function (id, connection) {
    connection.on('open', function () { connectionOpen(id, connection) });
    connection.on('data', function (data) { connectionData(id, data, connection) });    
    connection.on('close', function () { connectionClose(id, connection) });    
    connection.on('error', function (error) { connectionError(id, error, connection) });
  };
  
  const getMessages = async function (channel) {
    let messages = await client.api.get('/channels/'+channel+'/messages');
    return messages;
  };

  const parseMessages = function (messages) {
    const parsed = { clients: {}, rooms: {} };
    const slicedMessages = messages.slice(-64 || opts.messageLimit);
    
    slicedMessages.forEach(message => {
      const contentList = message.content.split(' ');
      const first = contentList[0];
      const state = contentList[1];
      const id = contentList[2];

      if (message.author == client.user._id) {
        if (first == 'player' && id !== peer.id) parsed.clients[id] = state;
        if (first == 'room') parsed.rooms[id] = state;
      }
    });
    
    const data = { clients: [], rooms: [] };
    for (let id in parsed.clients ) {
      if (parsed.clients[id] == 'joined') data.clients.push(id);
    }
    for (let id in parsed.rooms ) {
      if (parsed.rooms[id] == 'created') data.rooms.push(id);
    }
    
    return data;
  };

  const parseMessage = function (message) {
    
    const contentList = message.content.split(' ');
    const first = contentList[0];
    const state = contentList[1];
    const id = contentList[2];

    if (message.author._id == client.user._id) {
      if ( (first == 'player' && id !== peer.id) || 
           (first == 'room') ) {
        return { id, first, state };
      }
    }
  };
  
  const getChannelData = async function () {    
    const messages = await getMessages(channelId);
    const channelData = parseMessages(messages);
    return channelData;
  };
  
  const sendMessage = function (message) {
    client.api.post('/channels/'+channelId+'/messages', {
      content: message
    });
  };
  
  client.on('ready', function () {
    log('client ready', client);
    
    const id = peer.id;
    sendMessage('player joined ' + id);
    
    eventTarget.dispatchEvent(new CustomEvent('ready', { 
      detail: { id }
    }));
  });
  
  client.on('message', function (message) {
    log('message', message)
    
    var messageData = parseMessage(message);
    eventTarget.dispatchEvent(new CustomEvent('message', {
      detail: { messageData }
    }));
    
    if (messageData && messageData.first == 'player' && messageData.state == 'joined') {
      log('player joined', messageData)
      
      var joinedId = messageData.id;
      var connection = peer.connect(joinedId);

      connection.on('open', function () {
        log('connected to join', connection);
        eventTarget.dispatchEvent(new CustomEvent('join', {
          detail: { id: joinedId, connection } 
        }));
      });
      
      addConnectionEvents(joinedId, connection);
      
    } /* close player joined */ 
    
  }); /* close on message */ 

  client.on('error', function (err) {
    log('client error', err)
    eventTarget.dispatchEvent(new CustomEvent('error'), {
      detail: { err, client }
    });
  });
  
  return {
    on, client, peer,
    sendMessage,
    getMessages,
    parseMessage,
    getChannelData,
    connect: peer.connect, 
    disconnect: peer.disconnect,
    reconnect: peer.reconnect,
    destroy: peer.destroy
  };
}

