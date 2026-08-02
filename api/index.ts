// Lazily import the Express app so initialization (which may validate env vars)
// can be caught and turned into a controlled 500 response instead of crashing
// the serverless function on module import.
export default async function handler(req: any, res: any) {
  try {
    const module = await import('../backend/src/app');
    const app = module.default;
    // If app is an Express instance, it can be invoked as a handler.
    return app(req, res);
  } catch (err: any) {
    // Log the error to Vercel function logs for diagnosis.
    console.error('Error initializing app in serverless function:', err);

    // Respond with a generic 500. In non-production include the error message
    // to help debugging. Avoid exposing stack traces in production.
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    const body: any = { success: false, error: 'Internal Server Error' };
    if (process.env.NODE_ENV !== 'production') body.details = String(err?.message ?? err);
    res.end(JSON.stringify(body));
    return;
  }
}
