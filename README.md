# sub-workers
 
This is a subscription conversion service driven by [Sub-Store](https://github.com/tbxark-fork/Sub-Store) and compatible with the [subconverter](https://github.com/tindy2013/subconverter) API, running on Cloudflare Worker.

## Deploy
```shell
yarn && yarn run deploy
```

## Example
```python
requests.get(
    url="https://subconvert.tbxark.com/sub",
    params={
        "target": "surge",
        "url": "https://raw.githubusercontent.com/freefq/free/master/v2",
    },
)
```

## LICENSE
**sub-workers** is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.