
var ethers = require('ethers');
var providers = ethers.providers;

import {ERC20} from './artifacts.js';

import program from 'commander';
import fs from 'fs';

import logger, {Riot} from './logger';

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
        return provider.getBalance(address)
    } else {
        return contract.balanceOf(address)
    }
}

async function watchBalance(address, conf) {
    let {token, min, decimals=18} = conf;

    var contract = undefined;
    if (token != undefined) {
        contract = new ethers.Contract(token, ERC20, provider);
    }

    updateFn = async () => {
        let balance = await getBalance(address, contract);

        console.log("Balance:")
        console.log(balance)
    };

    updateFn();
    setInterval(async () => {
        updateFn();
    }, INTERVAL * SECONDS);
}

async function watchAddress(address, balances) {
    for (const {token, min} of balances) {
        watchBalance(address, token, min)
    }
}

program
    .command('watch <config>')
    .action((config, cmd) => {
        const {watch, network} = JSON.parse(fs.readFileSync(config).toString());
        setupProvider(network);

        for (const conf of watch) {
            watchAddress(address, conf)
        }
    });

program.parse(process.argv);
