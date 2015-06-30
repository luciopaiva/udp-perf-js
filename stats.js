
var
    metrics,
    header,
    headerPeriod = 10, lineIndex = 0, columnWidth = 10;


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

function print() {
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

function init(_metrics) {
    metrics = _metrics;
    makeHeader();
}

module.exports = {
    init: init,
    print: print
};
