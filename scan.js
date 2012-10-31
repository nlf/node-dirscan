var fs = require('fs'),
    request = require('request'),
    async = require('async');

var argv = require('optimist')
    .demand('w')
    .describe('w', 'Wordlist')
    .demand(2)
    .argv;

var target = argv._[0],
    threads = parseInt(argv._[1], 10),
    output = fs.createWriteStream('./scan.txt');

var wordlist = fs.readFileSync(argv.w, 'utf8').split('\n');
console.log('starting with ' + wordlist.length + ' jobs');

function addPrefix(prefix) {
    wordlist.forEach(function (word) {
        q.push(prefix + '/' + word);
    });
}

var q = async.queue(function (task, callback) {
    request({ method: 'head', uri: target + '/' + task }, function (err, res, body) {
        if (!err && res.statusCode !== 404) {
            console.log('FOUND:', task, '-', res.statusCode);
            output.write(task + ' - ' + res.statusCode + '\n');
            addPrefix(task);
        } else if (err) {
            q.push(task);
        }
        process.stdout.write('\r' + q.length() + ' remaining');
        callback();
    });
}, threads);

q.drain = function () {
    console.log('done');
    process.exit();
};

q.push(wordlist);
