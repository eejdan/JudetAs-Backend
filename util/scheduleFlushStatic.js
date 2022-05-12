

const fs = require('fs');

const path = __dirname + '\\..\\tempstatic\\'

var lastTimeout = Date.now() - (30 * 60 * 60 * 1000);
function scheduleFlushStatic() {
    if(lastTimeout > Date.now() - (10 * 1000)) {
        return;
    }
    lastTimeout = Date.now();
    flushStatic();
}

async function flushStatic() {
    fs.readdir(path, (err, files) => {
        if(err) console.log(err);
        files.forEach(file => {
            fs.unlink(path+file, (err) => {
                if(err) console.log(err);
            });
        })
    })
}
flushStatic();


module.exports = {
    scheduleFlushStatic,
    flushStatic
}