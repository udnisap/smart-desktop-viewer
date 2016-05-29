pc.script.create('websock-listner', function (app) {
    WebSocket = PUBNUB.ws;
     function setBandwidth(connection) {
            // www.RTCMultiConnection.org/docs/bandwidth/
            connection.bandwidth = {};
            connection.bandwidth.video = connection.bandwidth.screen = 512;
            connection.bandwidth.audio = 128;

            connection.processSdp = function(sdp) {
                if (DetectRTC.isMobileDevice || DetectRTC.browser.name === 'Firefox') {
                    return sdp;
                }

                sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
                sdp = CodecsHandler.setVideoBitrates(sdp, {
                    min: connection.bandwidth.video * 8 * 1024,
                    max: connection.bandwidth.video * 8 * 1024
                });
                sdp = CodecsHandler.setOpusAttributes(sdp, {
                    maxaveragebitrate: connection.bandwidth.audio * 8 * 1024,
                    maxplaybackrate: connection.bandwidth.audio * 8 * 1024,
                    stereo: 1,
                    maxptime: 3
                });
                sdp = CodecsHandler.preferVP9(sdp);
                return sdp;
            };
        }
    
    
    function connect(session){
      

        // http://www.rtcmulticonnection.org/docs/constructor/
        var connection = new RTCMultiConnection(session);

        setBandwidth(connection);

        connection.optionalArgument = {
            optional: [{
                DtlsSrtpKeyAgreement: true
            }, {
                googImprovedWifiBwe: true
            }, {
                googScreencastMinBitrate: 300 * 8 * 1024
            }, {
                googIPv6: true
            }, {
                googDscp: true
            }, {
                googCpuUnderuseThreshold: 55
            }, {
                googCpuOveruseThreshold: 85
            }, {
                googSuspendBelowMinBitrate: true
            }, {
                googCpuOveruseDetection: true
            }],
            mandatory: {}
        };

        var attachMediaStream, reattachMediaStream;
        if (navigator.mozGetUserMedia) {
            attachMediaStream = function(element, stream) {
                console.log("Attaching media stream");
                element.mozSrcObject = stream;
                element.play();
            };
            reattachMediaStream = function(to, from) {
                console.log("Reattaching media stream");
                to.mozSrcObject = from.mozSrcObject;
                to.play();
            };
        } else if (navigator.webkitGetUserMedia) {
            attachMediaStream = function(element, stream) {
                if (typeof element.srcObject !== 'undefined') {
                    element.srcObject = stream;
                } else if (typeof element.mozSrcObject !== 'undefined') {
                    element.mozSrcObject = stream;
                } else if (typeof element.src !== 'undefined') {
                    element.src = URL.createObjectURL(stream);
                } else {
                    console.log('Error attaching stream to element.');
                }
            };
            reattachMediaStream = function(to, from) {
                to.src = from.src;
            };
        } else {
            alert('Not Supported');
            console.log("Browser does not appear to be WebRTC-capable");
        }
        // onstream event; fired both for local and remote videos
        
        var screen = session.split('-')[1];
        connection.onstream = function(e) {
            if (e.type == 'remote') {
                app.fire('stream', screen, e.stream);
                websocket.send('received-your-screen');
            }
        };
        // if user left
        connection.onleave = function(e) {
            connection.onSessionClosed();
        };

        connection.onSessionClosed = function() {
            connection.close();
            websocket.onopen();
        };

        connection.ondisconnected = connection.onSessionClosed;
        connection.onstreamended = connection.onSessionClosed;


            // Set the video displaying in the center of window.


        // using websockets as signaling medium
        // http://www.rtcmulticonnection.org/docs/openSignalingChannel/
        // using websockets for signaling
        // www.RTCMultiConnection.org/docs/openSignalingChannel/
        var onMessageCallbacks = {};
        var pub = 'pub-c-3c0fc243-9892-4858-aa38-1445e58b4ecb';
        var sub = 'sub-c-d0c386c6-7263-11e2-8b02-12313f022c90';

        var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + connection.channel);

        websocket.onmessage = function(e) {
            data = JSON.parse(e.data);

            if (data.sender == connection.userid) return;

            if (onMessageCallbacks[data.channel]) {
                onMessageCallbacks[data.channel](data.message);
            };
        };

        websocket.push = websocket.send;
        websocket.send = function(data) {
            data.sender = connection.userid;
            websocket.push(JSON.stringify(data));
        };

        // overriding "openSignalingChannel" method
        connection.openSignalingChannel = function(config) {
            var channel = config.channel || this.channel;
            onMessageCallbacks[channel] = config.onmessage;

            if (config.onopen) setTimeout(config.onopen, 1000);

            // directly returning socket object using "return" statement
            return {
                send: function(message) {
                    websocket.send({
                        sender: connection.userid,
                        channel: channel,
                        message: message
                    });
                },
                channel: channel
            };
        };

        websocket.onerror = function() {
            if(connection.numberOfConnectedUsers <= 0) {
                location.reload();
            }
        };

        websocket.onclose = function() {
            if(connection.numberOfConnectedUsers <= 0) {
                location.reload();
            }
        };


        websocket.onopen = function() {

            var sessionDescription = {
                userid: session,
                extra: {},
                session: {
                    video: true,
                    oneway: true
                },
                sessionid: session
            };

            if (session) {

                // http://www.rtcmulticonnection.org/docs/join/
                connection.join(sessionDescription);
            }
        };
    }
    
    // var name = 'virtualdesk-'
    var name = window.location.search.replace('?','');
    
    connect(name + '-screen1');
    connect(name + '-screen2');
    
    
    
    // Creates a new Websock instance
    var Websock = function (entity) {
        this.entity = entity;
    };

    Websock.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return Websock;
});
