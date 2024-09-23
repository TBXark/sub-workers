import * as utils  from "sub-store-proxy-tools/core-export.js"

const { parse, produce } = utils.default

function loadProducer(target) {
    const t = target.toLowerCase()
    for (const key of Object.keys(produce)) {
        if (key.toLowerCase() === t) {
            return produce[key]
        }
    }
    return null
}

async function convert(url, target) {
    const producer = loadProducer(target)
    if (!producer) {
        throw new Error(`Unknown target: ${target}`)
    }
    const text = atob(await (await fetch(url)).text())
    const urls = text.split('\n').filter(Boolean)

    const proxyList = []
    
    for (const url of urls) {
        for (const p of parse) {
            try {
                if (p.test(url)) {
                    const proxy = p.parse(url)
                    proxyList.push(proxy)
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    if (producer.type === 'ALL') {
        return producer.produce(proxyList)
    } else {
        let res = ''
        for (const proxy of proxyList) {
            try {
                res += producer.produce(proxy, producer.type) + '\n'
            } catch (e) {
                console.error(e)
            }
        }
        return res
    }
}

export default {
    async fetch(request) {
        const uri = new URL(request.url)
        const target = uri.searchParams.get('target')
        const url = uri.searchParams.get('url')
        if (!target || !url) {
            return new Response('Missing target or url', { status: 400 })
        }
        try {
            const res = await convert(url, target)
            return new Response(res, { status: 200 })
        } catch (e) {
            return new Response(e.message, { status: 500 })
        }
    }
}