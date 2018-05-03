
var ethers = require('ethers');
var providers = ethers.providers;

import {ERC20} from './artifacts.js';

import program from 'commander';
import fs from 'fs';

import Bignumber from 'bignumber.js';
import logger, {Riot} from './logger';

console.log(process.env)

let riot = new Riot({
    token: process.env.RIOT_TOKEN,
    room: process.env.RIOT_ROOM,
    user: process.env.RIOT_USER,
});

const SECONDS  = 1000;
const INTERVAL = 10;

var provider = undefined;

function setupProvider(network) {
    let endpoint = "";
    switch (network) {
        case "kovan":
            endpoint = "https://kovan.infura.io";
            break;
        case "mainnet":
            endpoint = "https://mainnet.infura.io";
            break;
        default:
            throw Error(`Network ${network} not found`)
    }

    provider = new providers.JsonRpcProvider(endpoint, network);
}

async function getBalance(address, contract) {
    if (contract == undefined) {
        let balance = provider.getBalance(address)
        return new Bignumber(balance);

    } else {
        let balance = await contract.balanceOf(address);
        balance = new Bignumber(balance.toString())
        balance = balance.div(10 ** contract.decimals);

        return balance
    }
}

async function watchBalance(address, alias, conf) {
    let {token, min, msg, decimals=18} = conf;

    var asset = token != undefined ? token : 'ether';
    var contract = undefined;
    if (token != undefined) {
        contract = new ethers.Contract(token, ERC20, provider);
        contract.decimals = decimals;
    }

    min = new Bignumber(min);

    alias = alias == undefined ? address : alias;
    msg   = msg   == undefined ? ` balance is lower than min ${min}` : msg;

    const updateFn = async () => {
        let balance = await getBalance(address, contract);
        logger.info(`${address}: ${asset} ${balance} `)
        
        if (balance.lt(min)) {
            riot.error(`${alias}: ${msg}`);
        }
    };
    
    updateFn();
    setInterval(async () => {
        updateFn();
    }, INTERVAL * SECONDS);
}

async function watchAddress(address, alias, balances) {
    for (const conf of balances) {
        watchBalance(address, alias, conf)
    }
}

program
    .command('watch <config>')
    .action((config, cmd) => {
        const {watch, network} = JSON.parse(fs.readFileSync(config).toString());
        setupProvider(network);

        for (const {address, alias, balance} of watch) {
            watchAddress(address, alias, balance)
        }
    });

program.parse(process.argv);
