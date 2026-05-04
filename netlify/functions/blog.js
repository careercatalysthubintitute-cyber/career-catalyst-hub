const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:     process.env.FIREBASE_PROJECT_ID,
      clientEmail:   process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
const SITE      = "https://careercatalysthub.in";
const SITE_NAME = "Career Catalyst Hub Institute";
const FALLBACK_IMG = SITE + "/og-image.jpg";

function esc(str) {
  return (str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stripTags(html) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildHtml(blogId, blog) {
  const title = esc(blog.title || SITE_NAME);
  const desc  = esc(stripTags(blog.desc || blog.content || "").substring(0, 200));
  const image = esc(blog.img  || FALLBACK_IMG);
  const url   = `${SITE}/blog/${encodeURIComponent(blogId)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — ${esc(SITE_NAME)}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type"        content="article">
  <meta property="og:site_name"   content="${esc(SITE_NAME)}">
  <meta property="og:url"         content="${esc(url)}">
  <meta property="og:title"       content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image"       content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image"       content="${image}">
  <meta http-equiv="refresh" content="0; url=${esc(SITE + '/?blog=' + encodeURIComponent(blogId))}">
  <style>
    body{font-family:sans-serif;background:#0a1628;color:#e8edf7;
         display:flex;align-items:center;justify-content:center;
         min-height:100vh;margin:0;text-align:center;}
    .w{max-width:480px;padding:24px;}
    h1{font-size:1.3rem;margin-bottom:8px;}
    p{color:#a8b4cc;font-size:0.9rem;margin-bottom:16px;}
    a{color:#c9a227;font-weight:700;}
  </style>
</head>
<body>
  <div class="w">
    <h1>${title}</h1>
    <p>${desc}</p>
    <a href="${esc(SITE + '/?blog=' + encodeURIComponent(blogId))}">Open article →</a>
  </div>
</body>
</html>`;
}

exports.handler = async function(event) {
  const blogId = event.path.replace(/^\/blog\/?/, "").split("?")[0];

  if (!blogId) {
    return { statusCode: 302, headers: { Location: SITE } };
  }

  const ua = (event.headers["user-agent"] || "").toLowerCase();
  const isCrawler = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|googlebot/i.test(ua);

  if (!isCrawler) {
    return {
      statusCode: 302,
      headers: { Location: `${SITE}/?blog=${encodeURIComponent(blogId)}` }
    };
  }

  try {
    const doc = await db.collection("blogs").doc(blogId).get();
    const blog = doc.exists ? doc.data() : {
      title: "Article Not Found",
      desc:  "Visit careercatalysthub.in for more articles.",
      img:   FALLBACK_IMG
    };
    return {
      statusCode: doc.exists ? 200 : 404,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=600"
      },
      body: buildHtml(blogId, blog)
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: buildHtml(blogId, { title: SITE_NAME, desc: "", img: FALLBACK_IMG })
    };
  }
};
