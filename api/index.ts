import app from '../backend/src/app';

// Vercel serverless function handler that forwards requests to the existing Express app.
// Using plain types to avoid requiring extra @types packages in the project.
export default function handler(req: any, res: any) {
  return app(req, res);
}
