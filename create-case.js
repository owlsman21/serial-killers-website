const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function convertToEmbedURL(url) {
  // YouTube watch link
  if (url.includes('youtube.com/watch?v=')) {
    const videoID = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoID}`;
  }

  // YouTube short link
  if (url.includes('youtu.be/')) {
    const videoID = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoID}`;
  }

  // OK.ru standard video link
  if (url.includes('ok.ru/video/')) {
    const videoID = url.split('/video/')[1].split(/[/?]/)[0];
    return `https://ok.ru/videoembed/${videoID}`;
  }

  // OK.ru embed link or other platforms
  return url;
}

(async () => {
  const title = await ask('Case title: ');
  const description = await ask('Short description: ');
  const image = await ask('Poster image filename (e.g. killer.jpg): ');
  const rawVideo = await ask('Video URL: ');
  const video = convertToEmbedURL(rawVideo);

  const slug = slugify(title);
  const filename = `${slug}.html`;
  const ogImageURL = `https://owlsman21.github.io/serial-killers-website/images/${image}`;
  const ogPageURL = `https://owlsman21.github.io/serial-killers-website/cases/${filename}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta property="og:title" content="${title} | True Crime Archive">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageURL}">
  <meta property="og:url" content="${ogPageURL}">
  <meta property="og:type" content="website">
  <title>${title} | True Crime Archive</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="../style.css">
  <link href="https://fonts.googleapis.com/css2?family=Oswald&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #000;
      color: #fff;
      font-family: 'Oswald', sans-serif;
      margin: 0;
      padding: 0;
      background-image: url("../images/night-stalker-bg.jpg");
      background-size: cover;
      background-attachment: fixed;
      background-position: center;
    }
    .container {
      padding: 40px;
      background-color: rgba(0, 0, 0, 0.7);
      max-width: 900px;
      margin: auto;
    }
    h1 {
      color: red;
      font-size: 36px;
      margin-bottom: 20px;
      text-shadow: 2px 2px 6px black;
    }
    h2 {
      color: #ff4d4d;
      font-size: 24px;
      margin-top: 40px;
      text-align: center;
    }
    .warning {
      color: yellow;
      font-weight: bold;
      text-align: center;
      margin-bottom: 30px;
    }
    p {
      line-height: 1.6;
      font-size: 18px;
      margin-bottom: 20px;
    }
    .video-container {
      text-align: center;
      margin-bottom: 40px;
    }
    .poster {
      width: 100%;
      max-width: 600px;
      display: block;
      margin: 40px auto;
      box-shadow: 0 0 10px #000;
    }
    a.return {
      color: red;
      text-decoration: none;
      font-size: 16px;
      display: block;
      margin-top: 40px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>

    <a href="https://owlsman21.github.io/serial-killers-website/" class="return">← Return to Archive</a>

    <h2>🎬 Watch <em>${title}</em></h2>
    <p class="warning">⚠️ Viewer discretion advised. Contains disturbing content based on real events.</p>

    <a href="${filename}" target="_blank">
      <img src="../images/${image}" alt="${title} Poster" class="poster">
    </a>

    <div class="video-container">
      <iframe class="okru-iframe"
              src="${video}"
              allow="autoplay" allowfullscreen="true"
              width="600" height="338" frameborder="0">
      </iframe>
    </div>

    <p>[Add full case description here]</p>

    <a href="https://owlsman21.github.io/serial-killers-website/" class="return">← Return to Archive</a>
  </div>
</body>
</html>`;

  const outputPath = path.join(__dirname, 'cases', filename);
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Case page created: ${outputPath}`);

  rl.close();
})();