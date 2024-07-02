const express = require("express")
const fs = require("fs")
const app = express()
const path = require('path');
const cors = require('cors')

// Enable CORS for all routes
app.use(cors());

app.listen(8000,function(){
    console.log("Listening on port 8000!")
})


app.get("/video",function(req,res){
    // console.log(req)
    console.log(req.headers)
    const range = req.headers.range; 
    //TODO: read about range
    //TODO 2 : understand the last play resume
    let start = 0
    if(!range){
        res.status(400).send("Require range header")
        // return
    }else{
        start = Number(range.replace(/\D/g,""));
        console.log(`start = ${start}`)
    }
    const videoPath = "oggy.mp4";
    const videoSize = fs.statSync("oggy.mp4").size;
    const CHUNK_SIZE = 10 ** 6
    
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range":`bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges":"bytes",
        "Content-Length":contentLength,
        "Content-Type":"video/mp4"
    };
    res.writeHead(206,headers)
    const videoStream = fs.createReadStream(videoPath,{start,end});
    videoStream.pipe(res)

})


app.get("/",function(req,res){
    res.sendFile(__dirname + "/index.html")
})


app.get("/stream-dash",function(req,res){
    const videoPath = 'oggy-dash/'; // Path to your DASH content directory
        const manifestFile = path.join(videoPath, 'output.mpd'); // Example manifest file
        // const segmentDir = path.join(videoPath, 'segments/'); // Example segment directory
        const segmentDir = path.join(videoPath); 

        // Serve the manifest file
        if (req.headers.accept.includes('application/dash+xml')) {
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
        else if (req.headers.range) {
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
        } 
        else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad request');
            console.log("EErro")
        }
})