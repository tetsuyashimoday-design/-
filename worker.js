const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        try {
            const url = new URL(request.url);

            if (request.method === 'POST' && url.pathname === '/predict') {
                return await handlePredict(request, env);
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
    const { image, prompt, negative_prompt, prompt_strength, guidance_scale } = body.input;

    // data URL → Uint8Array
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const binaryStr = atob(base64Data);
    const imageArray = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        imageArray[i] = binaryStr.charCodeAt(i);
    }

    const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
        prompt:          prompt          || 'studio ghibli style, anime, miyazaki',
        negative_prompt: negative_prompt || 'realistic, photographic, ugly, blurry',
        image:           [...imageArray],
        strength:        prompt_strength  || 0.75,
        guidance:        guidance_scale   || 7.5,
        num_steps:       20,
    });

    // ReadableStream → base64
    const arrayBuffer = await new Response(result).arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const chunks = [];
    for (let i = 0; i < uint8.length; i += 8192) {
        chunks.push(String.fromCharCode(...uint8.subarray(i, i + 8192)));
    }
    const base64Result = btoa(chunks.join(''));

    return new Response(
        JSON.stringify({
            status: 'succeeded',
            output: `data:image/png;base64,${base64Result}`,
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
}
