# Santhosh Reddy Portfolio

## Run locally
1. Install Node.js 18 or newer.
2. Open this folder in VS Code.
3. In the terminal, run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your Gmail address and a newly generated Gmail App Password in `.env`.
6. Run `npm start`.
7. Open http://localhost:3000

Check the backend at http://localhost:3000/api/health.

## Important
- Do not commit `.env` or publish your Gmail App Password.
- The contact form requires Gmail 2-Step Verification and an App Password.
- For Netlify, set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in the site's environment variables and redeploy. The `/api/contact` route is served by the function in `netlify/functions/contact.js`.
- The portfolio chatbot uses `GEMINI_API_KEY` and `GEMINI_MODEL`; set both in Netlify's environment variables with Functions scope enabled, then redeploy. Its profile answers come from `knowledge/profile.json`, and `/api/chat` is served by `netlify/functions/chat.js`.
- Keep `index.html`, `style.css`, and `script.js` in the project root.
- Put your profile image at `photo1.png` in the project root, or update the image path in index.html.
- Replace placeholder LinkedIn links with your actual profile URL.
