
var
    stats = require('./stats');

var
    SERVER_ADDRESS = 'localhost',
    SERVER_PORT = 41234;

var message = new Buffer("0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"),
    client,
    metrics = {
        sent: 0,
        received: 0,
        balance: 0,
        error: 0
    };

function startSocket() {

    client = require('dgram').createSocket("udp4");

    client.on("message", function (msg, rinfo) {
        metrics.received++;
    });
}

function send() {
    client.send(message, 0, message.length, SERVER_PORT, SERVER_ADDRESS, function(err) {
        if (err) {
            metrics.error++;
        } else {
            metrics.sent++;
        }
    });
}

function sendForever() {
    send();
    setImmediate(sendForever);
}

function start() {

    stats.init(metrics);
    setInterval(stats.print, 1000);
    startSocket();

    sendForever();
}

start();
