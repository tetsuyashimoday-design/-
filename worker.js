const REPLICATE_API = 'https://api.replicate.com/v1';
const MODEL_OWNER   = 'stability-ai';
const MODEL_NAME    = 'stable-diffusion-img2img';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);

        try {
            if (request.method === 'POST' && url.pathname === '/predict') {
                return await handlePredict(request, env);
            }

            const pollMatch = url.pathname.match(/^\/predictions\/([^/]+)$/);
            if (request.method === 'GET' && pollMatch) {
                return await handlePoll(pollMatch[1], env);
            }

            return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
        } catch (err) {
            return new Response(
                JSON.stringify({ error: err.message }),
                { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }
    },
};

async function handlePredict(request, env) {
    const body = await request.json();

    const response = await fetch(
        `${REPLICATE_API}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Token ${env.REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
}

async function handlePoll(predictionId, env) {
    const response = await fetch(
        `${REPLICATE_API}/predictions/${predictionId}`,
        {
            headers: { 'Authorization': `Token ${env.REPLICATE_API_KEY}` },
        }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
}
