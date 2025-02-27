const express = require("express");
const fs = require("fs");
const appServer = express();

// Serve video files
appServer.get("/video", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins (or specify your origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers

  let decodedPath = decodeURIComponent(req.query.path);
  decodedPath = decodedPath.split('?')[0];
  
  if (!decodedPath || !fs.existsSync(decodedPath)) {
    return res.status(404).send("Video file not found");
  }

  const stat = fs.statSync(decodedPath);
  if (stat.size === 0) {
    return res.status(404).send("Video file is empty");
  }

  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).send("Requested Range Not Satisfiable");
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(decodedPath, { start, end });

    // Disable caching
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(decodedPath).pipe(res);
  }
});

// Start the Express server on the port specified in the .env file
const startServer = (port) => {
  appServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

module.exports = startServer;
