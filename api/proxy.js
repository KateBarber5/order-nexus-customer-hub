module.exports = async function (context, req) {
    // CORS headers
    context.res.setHeader('Access-Control-Allow-Origin', '*');
    context.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    context.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    context.res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        return;
    }

    try {
        const { endpoint, method = 'GET', data } = req.body;
        
        if (!endpoint) {
            context.res.status = 400;
            context.res.body = { error: 'Endpoint is required' };
            return;
        }

        // Build the target URL
        const targetUrl = `https://order.govmetric.ai${endpoint}`;
        
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Make the request to the target API
        const response = await fetch(targetUrl, {
            method: method.toUpperCase(),
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        // Get the response data
        const responseText = await response.text();
        let responseData;
        
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        // Return the response
        context.res.status = response.status;
        context.res.body = responseData;
        
    } catch (error) {
        context.log.error('Proxy error:', error);
        context.res.status = 500;
        context.res.body = { error: 'Internal server error', details: error.message };
    }
};