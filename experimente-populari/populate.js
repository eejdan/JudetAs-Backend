
if (require.main === module) {
    require('dotenv').config();
}

const crypto = require('crypto');
const sha256 = crypto.createHash('sha256');

const mongoose = require('mongoose')
const LocalInstance = require('../schemas/localInstance')
const User = require('../schemas/user');

var randomWords = require('random-words');
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
class populateSolve {
    constructor(solvesRequired) {
        this.solvesNumber = parseInt(solvesRequired)-1;
        this.currentSolves = 0;
    }
    get reportSolve() {
        this.currentSolves += 1;
        if(this.currentSolves > this.solvesNumber) {
            mongoose.disconnect();
            process.exit()
        }
        return true;
    }
}
let finishObject;
async function populateLocalInstances() {
    let csv = require("csv-parser")
    let fs = require("fs")
    let results = [];
    fs.createReadStream('C:/Users/dani/t1.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', async data => {
        results.push(data)
        console.log(data.JUD)         
    })
    .on('end', async () => {
        await LocalInstance.insertMany(
            await Promise.all(results.map(row => {
                let container = {}
                container.meta = {}
                container.meta.Mnemonic = row.MNEMONIC
                container.meta.localNumber = parseInt(row.JUD)
                container.displayName = row.DENJ
                    .toLowerCase().trim().split('-')
                    .map(element => 
                        element.charAt(0).toUpperCase() + element.slice(1)
                    ).join('-') 
                container.rank = 0;
                console.log(container);
                return container;
            }))
        )
        console.log('CSV file successfully processed');
        console.log(finishObject.reportSolve);
    });   
}

async function populateUsers() {
    for(let i=1;i<=10;i++) {
        console.log(randomWords(2))
        let randomCNP = ''
        for(let i=1;i<=13;i++) {
            randomCNP += getRandomInt(10)+'';
        }
        await User.create({
            username: randomWords(1)[0],
            firstName: randomWords(1)[0],
            lastName: randomWords(1)[0],
            password: randomWords(1)[0],
            registrationDate: Date.now(),
            meta: {
                CNP: sha256.update(randomCNP).digest('hex')+''
            }
        })
    } 
}
async function continueRun() {
    console.log('cr');
    //setTimeout(populateUsers(), 1);
    finishObject = new populateSolve(1);
    populateLocalInstances();    
}

async function init() {
    mongoose.connect(
        'mongodb+srv://'
        +process.env.BACKEND_MONGO_USERNAME
        +':'+process.env.BACKEND_MONGO_PASSWORD
        +'@'+process.env.BACKEND_MONGO_URL, {
            dbName: 'JudetAs',
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    setTimeout(continueRun, 100)
}
init().catch(err => console.log(err));