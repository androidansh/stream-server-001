const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Example endpoint for serving DASH content
    if (req.url === '/stream-dash') {
        const videoPath = 'oggy-dash/'; // Path to your DASH content directory
        const manifestFile = path.join(videoPath, 'output.mpd'); // Example manifest file
        // const segmentDir = path.join(videoPath, 'segments/'); // Example segment directory
        const segmentDir = path.join(videoPath,"/"); 

        // Serve the manifest file
        if (req.method === 'GET' && req.headers.accept.includes('application/dash+xml')) {
            fs.readFile(manifestFile, (err, data) => {
                if (err) {
                    console.error('Error reading manifest file:', err);
                    res.writeHead(500);
                    res.end();
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': 'application/dash+xml',
                    'Content-Length': data.length
                });
                res.end(data);
            });
        }

        // Serve DASH segment files
        else if (req.method === 'GET' && req.headers.range) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, "").split("-");
            const partialStart = parseInt(parts[0], 10);
            const partialEnd = parts[1] ? parseInt(parts[1], 10) : null;

            const segmentFile = path.join(segmentDir, `chunk_stream0_${partialStart}.m4s`); // Adjust as per your segment naming convention

            fs.stat(segmentFile, (err, stat) => {
                if (err) {
                    console.error('Error reading segment file:', err);
                    res.writeHead(404);
                    res.end();
                    return;
                }

                const fileSize = stat.size;
                const start = partialStart;
                const end = partialEnd ? partialEnd : fileSize - 1;
                const contentLength = end - start + 1;

                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': contentLength,
                    'Content-Type': 'video/mp4'
                });

                const videoStream = fs.createReadStream(segmentFile, { start, end });
                videoStream.pipe(res);
            });
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad request');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});