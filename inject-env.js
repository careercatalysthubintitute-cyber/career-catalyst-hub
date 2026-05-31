const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('__FIREBASE_API_KEY__', process.env.FIREBASE_API_KEY || '');
html = html.replace('__FIREBASE_AUTH_DOMAIN__', process.env.FIREBASE_AUTH_DOMAIN || '');
html = html.replace('__FIREBASE_PROJECT_ID__', process.env.FIREBASE_PROJECT_ID || '');
html = html.replace('__FIREBASE_STORAGE_BUCKET__', process.env.FIREBASE_STORAGE_BUCKET || '');
html = html.replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.FIREBASE_MESSAGING_SENDER_ID || '');
html = html.replace('__FIREBASE_APP_ID__', process.env.FIREBASE_APP_ID || '');
html = html.replace('__FIREBASE_MEASUREMENT_ID__', process.env.FIREBASE_MEASUREMENT_ID || '');

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);

console.log('✅ index.html built with Firebase config injected.');
