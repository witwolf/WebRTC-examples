/**
 * Created by witwolf on 1/5/16.
 */



var signaling_server = 'ws://127.0.0.1:9999'

function values(obj) {
    var vals = [];
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            vals.push(obj[key]);
        }
    }
    return vals;
};


function createSignalingChannel(signalingListener) {
    var name = prompt('Please input your name', 'Guest' + Math.floor(Math.random() * 1000000));
    var socket = io(signaling_server, {query: 'name=' + name});

    socket.sendSignal = function (receiver, signalType, signalData) {
        socket.emit('signal', {sender: socket.id, receiver: receiver, signalType: signalType, signalData: signalData});
    }

    return socket;
}


function createPeerConnection(signalingChannel, config, user) {
    var peerConnection;
    var sendChannel;
    var receiveChannel;

    peerConnection = new RTCPeerConnection(config);
    sendChannel = peerConnection.createDataChannel('sendDataChannel', null);
    // TODO
    //sendChannel.onopen = function(){};
    //sendChannel.onclose = function(){};

    peerConnection.ondatachannel = function (event) {
        receiveChannel = event.channel;
        if (onMessageListener) {
            receiveChannel.onmessage = onMessageListener;
        } else {
            receiveChannel.onmessage = function (event) {
            };
        }
        //receiveChannel.onopen = function(){};
        //receiveChannel.onclose = function(){};
    }

    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            signalingChannel.sendSignal(user.id, 'candidate', event.candidate);
        }
    };

    peerConnection.oniceconnectionstatechange = function (event) {
        console.log('ice state :', peerConnection.iceConnectionState);
    };


    function addIceCandidate(candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate), function () {

        }, function (error) {

        });
    }

    function createOffer() {
        peerConnection.createOffer(function (desc) {
            setLocalDescription('offer', desc);
        }, function (error) {

        }, {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        });
    }

    function createAnswer() {
        console.log('create answer ...');
        peerConnection.createAnswer(function (desc) {
            console.log('create answer success and set local ');
            setLocalDescription('answer', desc);
        }, function (error) {
            console.log('create answer failed , error :', error);
        });
    }

    function setLocalDescription(type, desc) {
        console.log('set local ...');
        peerConnection.setLocalDescription(desc, function () {
            onSetLocalSuccess(desc, type);
        });
    }

    function onSetLocalSuccess(desc, signalType) {
        console.log('set local success ,send ' + signalType);
        signalingChannel.sendSignal(user.id, signalType, {sdp: desc.sdp, type: desc.type});
    }

    function setRemoteDescription(sdp) {
        if (!peerConnection.remoteDescription.type) {
            console.log('set remote ...')
            peerConnection.setRemoteDescription(new RTCSessionDescription(sdp), function () {
                console.log('set remote success');
                if (!peerConnection.localDescription.type) {
                    createAnswer();
                }

            });
        }
    }

    function setOnAddStreamListener(listener) {
        peerConnection.onaddstream = listener;
    }


    function close() {
        peerConnection.close();
    }

    var streamAdded = false;

    function addStream(stream) {
        if (!streamAdded && stream) {
            peerConnection.addStream(stream);
            streamAdded = true;
        }
    }

    function sendMessage(message) {
        if (sendChannel.readyState === 'open') {
            sendChannel.send(message);
            return true;
        }
        return false;
    }

    var onMessageListener = null;

    function setOnMessageListener(listener) {
        onMessageListener = listener;
        if (receiveChannel) {
            receiveChannel.onmessage = listener;
        }

    }

    return {
        createAnswer: createAnswer,
        createOffer: createOffer,
        addIceCandidate: addIceCandidate,
        setRemoteDescription: setRemoteDescription,
        addStream: addStream,
        setOnAddStreamListener: setOnAddStreamListener,
        sendMessage: sendMessage,
        setOnMessageListener: setOnMessageListener,
        close: close
    }

}

$(function () {
    var localVideo = $('#localVideo')[0];
    var remoteVideo = $('#remoteVideo')[0];
    var messageList = $('.message')
    var onlineList = $('#users ul');
    var currentInput = $('.input');
    var chatArea = $('.chatArea');


    var signalingChannel = createSignalingChannel();
    var localStream = null;
    openLocalVideo();
    var peerConnection = null;
    var iceServers = null;

    signalingChannel.on('initial', function (initialData) {
        iceServers = initialData.iceServers;
        initialData.user_list.forEach(function (user) {
            newUserOnline(user);
        });

    });

    signalingChannel.on('new_user_online', function (user) {
        newUserOnline(user);
    });

    signalingChannel.on('user_offline', function (user) {
        userOffline(user);
    });

    signalingChannel.on('signal', function (signal) {

        switch (signal.signalType) {
            case 'candidate':
                if (peerConnection) {
                    peerConnection.addIceCandidate(signal.signalData);
                }
                break;
            case 'answer':
                if (peerConnection) {
                    peerConnection.setRemoteDescription(signal.signalData);
                }
                break;
            case 'offer':
                if (users.hasOwnProperty(signal.sender)) {
                    var user = users[signal.sender];
                    if (confirm("accept " + user.name + "'s invitation ?")) {
                        peerConnection = createPeerConnection(signalingChannel, {iceServers: iceServers}, user);
                        peerConnection.setRemoteDescription(signal.signalData);
                        addStreamAndSetListener();
                    }
                }
                break;
        }
    });

    var users = {};
    var userElems = {};
    // user get online
    function newUserOnline(user) {
        var tpl = '<li><a><div class="cont clear"><img><div class="info"><p></p></div></div></a></li>';
        var $li = $(tpl);
        onlineList.append($li);
        userElems[user.id] = $li;
        users[user.id] = user;
        $li.find('p')[0].innerText = user.name;
        $li.on('click', function () {
            startChat(user);
        });
        console.log('user get online : ' + user.name + ',' + user.id);
    }

// user get offline
    function userOffline(user) {
        userElems[user.id].remove();
        delete userElems[user.id];
        delete users[user.id];
        console.log('user get offline : ' + user.name + ',' + user.id);
    }

    // start chat (video & message)
    var peerConnection = null;

    function startChat(user) {
        closeChat();
        console.log('chat to user : ' + user.name);
        peerConnection = createPeerConnection(signalingChannel, {iceServers: iceServers}, user);
        addStreamAndSetListener();
        peerConnection.createOffer();


    }


    // close chat
    function closeChat() {
        if (peerConnection !== null) {
            peerConnection.close();
            peerConnection = null;
            //console.log('close chat with user : ' + user.name);
        }
    }

    // open local video
    function openLocalVideo() {
        var constraint = {audio: false, video: true};
        getUserMedia(constraint, function (stream) {
            localVideo.srcObject = stream;
            localStream = stream;
            if (peerConnection != null) {
                peerConnection.addStream(stream);
            }
        }, function (error) {
            console.log('get user media error : ', error);
        });
    }


    // send chat message
    function sendMessage(message) {
        if (peerConnection.sendMessage(message)) {
            var tpl = '<li class="self"><div><img><p class="time"></p><p class="content"></p></div></li>';
            var $message = $(tpl);
            $message.find('.content')[0].innerText = message;
            $message.find('.time')[0].innerText = new Date().toTimeString().substring(0, 8);
            messageList.append($message);
            chatArea.scrollTop(chatArea.height());
        }
    }

    // receive chat message
    function receiveMessage(message) {
        var tpl = '<li class="other"><div><img><p class="time"></p><p class="content"></p></div></li>';
        var $message = $(tpl);
        $message.find('.content')[0].innerText = message.data;
        $message.find('.time')[0].innerText = new Date().toTimeString().substring(0, 8);
        messageList.append($message);
        chatArea.scrollTop(chatArea.height());
    }

    function addStreamAndSetListener() {
        peerConnection.addStream(localStream);
        peerConnection.setOnAddStreamListener(function (event) {
            remoteVideo.srcObject = event.stream;
        });
        peerConnection.setOnMessageListener(receiveMessage);
    }

    currentInput.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            sendMessage(currentInput.val());
            currentInput.val('');
        }
    });


});

