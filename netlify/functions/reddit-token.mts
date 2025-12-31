import { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
    const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        return new Response(JSON.stringify({ error: "Missing Reddit Credentials on Server" }), { status: 500 });
    }

    const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    try {
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'LeadReddit/1.0.0'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({ error: `Reddit Auth Failed: ${response.status}`, details: errorText }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const config: Config = {
    path: "/api/reddit-token"
};
