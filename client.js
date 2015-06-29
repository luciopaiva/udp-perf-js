
var
    dgram = require('dgram'),
    async = require('async');

var
    SERVER_ADDRESS = 'localhost',
    SERVER_PORT = 41234;

var message = new Buffer("0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"),
    client,
    header,
    headerPeriod = 10, lineIndex = 0, columnWidth = 10,
    metrics = {
        sent: 0,
        received: 0,
        balance: 0,
        error: 0
    },
    i = 10;

function padRight(text, len, c) {
    var
        result,
        pad = len - text.length;

    c = c || ' ';
    result = text;

    while (pad--) {
        result += c;
    }

    return result;
}

function makeHeader() {
    var
        line = '';

    header = '';

    Object.keys(metrics).forEach(function (metricName) {
        header += '| ' + padRight(metricName, columnWidth) + ' ';
    });
    header += '|';

    while (line.length < header.length) {
        if ((line.length % (columnWidth + 3)) == 0) {
            line += '+';
        } else {
            line += '-';
        }
    }

    header = line + '\n' + header + '\n' + line;
}

function stats() {
    var
        line = '';

    lineIndex %= headerPeriod;

    if (lineIndex++ == 0) {
        console.info(header);
    }

    metrics.balance = metrics.received - metrics.sent;

    Object.keys(metrics).forEach(function (metricName) {
        line += '| ' + padRight(metrics[metricName].toString(), columnWidth) + ' ';
        metrics[metricName] = 0;
    });
    line += '|';

    console.info(line);
}

function startSocket() {

    client = dgram.createSocket("udp4");

    client.on("message", function (msg, rinfo) {
        metrics.received++;
    });
}

function configureKeypress() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', function (key) {

        client.close();
    });
}

//function send(n, next) {
//    client.send(message, 0, message.length, SERVER_PORT, SERVER_ADDRESS, function(err) {
//        if (err) {
//            metrics.error++;
//        } else {
//            metrics.sent++;
//        }
//
//        //process.nextTick(sendBatch);
//        next();
//    });
//}
//
//function sendBatchComplete(err) {
//    process.nextTick(sendBatch);
//}
//
//function sendBatch() {
//    async.times(10000, send, sendBatchComplete);
//    //setTimeout(sendBatch, 1);
//}

function send(callback) {
    client.send(message, 0, message.length, SERVER_PORT, SERVER_ADDRESS, function(err) {
        if (err) {
            metrics.error++;
        } else {
            metrics.sent++;
        }

        if (callback) {
            callback();
        }
    });
}

//function sendBatch() {
//    var
//        i;
//
//    for (i = 0; i < 1000; i++) {
//        send();
//    }
//    send(process.nextTick.bind(null, sendBatch));
//}

function sendBatch() {
    send();
    //process.nextTick(sendBatch);
    setImmediate(sendBatch);
}

function start() {
    makeHeader();
    setInterval(stats, 1000);
    //configureKeypress();
    startSocket();

    sendBatch();
}

start();
