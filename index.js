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

function decodeIfNeed(raw) {
    try {
        return { text: atob(raw), decoded: true }
    } catch {
        return { text: raw, decoded: false }
    }
}

async function loadRemoteData(url) {
    try {
        const { text, decoded } = decodeIfNeed(await (await fetch(url)).text())
        const urls = decoded ? text.split('\n').filter(Boolean) : [text]
        return urls
    } catch (e) {
        console.error(e)
        return []
    }
}



export async function convert(url, target, opts) {
    const producer = loadProducer(target)
    if (!producer) {
        throw new Error(`Unknown target: ${target}`)
    }
    const lines = (await Promise.all(url.split('|').map(loadRemoteData))).flat()
    const proxyList = []
    for (const line of lines) {
        for (const p of parse) {
            try {
                if (p.test(line)) {
                    const proxy = p.parse(line)
                    proxyList.push({
                        ...proxy,
                        ...opts
                    })
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
        const opts = {}
        uri.searchParams.forEach((value, key) => {
            opts[key] = value
        })
        if (!target || !url) {
            return new Response('Missing target or url', { status: 400 })
        }
        try {
            const res = await convert(url, target, opts)
            return new Response(res, { status: 200 })
        } catch (e) {
            return new Response(e.message, { status: 500 })
        }
    }
}