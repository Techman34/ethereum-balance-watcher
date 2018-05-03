# Ethereum-Balance-Watcher

## Usage

```
$ node build/index.js watch ./config.json
```

where config.json looks like:

```
{
    "watch": [
        {
            "address": "0x...",
            "balance": [
                {
                    "min": 15
                },
                {
                    "token": "0x...",
                    "min": 12,
                    "decimals": 12
                }
            ]
        }
    ],
    "network": "kovan"
}
```

It will send messages to riot channel when the balance is less than *min*. If *token* is not specified, it will check the ether balance.
