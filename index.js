const express = require("express")
const fs = require("fs")
const app = express()
const cloudinary = require('cloudinary').v2;
const path = require('path');
const cors = require('cors')

// Enable CORS for all routes
app.use(cors());

app.listen(8000,function(){
    console.log("Listening on port 8000!")
})


app.get("/video",function(req,res){
    // console.log(req)

    console.log("Video api called")
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
    console.log("user visited")
    res.json({success:"welcome"})
})


app.get("/stream-dash2",function(req,res){
    const videoPath = 'oggy_dash/'; // Path to your DASH content directory
        const manifestFile = path.join(videoPath, 'output.mpd'); // Example manifest file
        // const segmentDir = path.join(videoPath, 'segments/'); // Example segment directory
        const segmentDir = path.join(videoPath); 
        console.log(req.headers)

        // Serve the manifest file
        if (req.headers.accept.includes('*/*')) {
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



app.get('/stream-dash3', (req, res) => {
    console.log("Dash api called")
    const manifestFile = path.join(__dirname, 'oggy_dash/output.mpd');
    fs.readFile(manifestFile, (err, data) => {
        if (err) {
            console.error('Error reading manifest file:', err);
            res.status(500).send('Error reading manifest file');
            return;
        }

        res.setHeader('Content-Type', 'application/dash+xml');

        res.send(data);
    });
});

// Serve DASH segment files
// app.get('/:segment', (req, res) => {
//     // console.log("inside the segment api")
//     const segmentPath = path.join(__dirname, 'oggy_dash', req.params.segment);
//     console.log(segmentPath)
//     fs.stat(segmentPath, (err, stat) => {
//         if (err || !stat.isFile()) {
//             console.error('Segment file not found:');
//             console.log(err)
//             res.status(404).send('Segment file not found');
//             return;
//         }

//         // const range = req.headers.range;
//         // console.log("Header data = ")
//         // console.log(req)
//         //let positions = [0]
//         // if (!range) {
//         //     res.status(416).send('Requires Range header');
//         // }
        
//         // positions = range.replace(/bytes=/, "").split("-");
        
//         // const start = parseInt(positions[0], 10);
//         const start = 0;
//         const total = stat.size;
//         const end = total - 1;
//         const chunksize = (end - start) + 1;
//         // const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        

//         // res.setHeader('Content-Range', );
//         // res.setHeader('Accept-Ranges', 'bytes');
//         // res.setHeader('Content-Length', chunksize);
//         // res.setHeader('Content-Type', 'video/mp4');

//         const headers = {
//             "Content-Range":`bytes ${start}-${end}/${total}`,
//             "Accept-Ranges":"bytes",
//             "Content-Length":chunksize,
//             "Content-Type":"video/mp4",
//             "Keep-Alive":"timeout=20"
//         };
//         res.writeHead(206,headers)
//         const stream = fs.createReadStream(segmentPath, { start, end });
//         stream.pipe(res);
//     });
// });


// // server for android
// app.get('/stream-dash', (req, res) => {
//     const dashManifestPath = path.join(__dirname, 'oggy_dash', 'output.mpd');
//     res.sendFile(dashManifestPath);
// });

// // // Serve the video segments
// app.get('/:segment', (req, res) => {
//     const segmentPath = path.join(__dirname, 'oggy_dash', req.params.segment);
//     // console.log(segmentPath)
//     res.sendFile(segmentPath);
// });



// app.get('/stream-dash4', (req, res) => {
//     const dashManifestPath = path.join(__dirname, 'oggy2Dash', 'stream.mpd');
//     res.sendFile(dashManifestPath);
// });

// // Serve the video segments
// app.get('/:segment', (req, res) => {
//    // console.log("<-------------------Request----------------------->")
//    // console.log(req)
//     const segmentPath = path.join(__dirname, 'oggy2Dash', req.params.segment);
//     // console.log(segmentPath)
//     res.sendFile(segmentPath);
// });




// in this api user will provide which video he wants to stream
app.get('/video/:id/stream-dash5', (req, res) => {
    const dashManifestPath = path.join(__dirname, req.params.id, 'output.mpd');
    
    res.sendFile(dashManifestPath);

});

// Serve the video segments
app.get('/video/:id/:segment', (req, res) => {
    const segmentPath = path.join(__dirname, req.params.id, req.params.segment);
    res.sendFile(segmentPath);
});


// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dfshwcvxu',
    api_key: '171136177283262',
    api_secret: '-PfMWe3k0EH5AJi1EyiIqI_6XhE'
});
  // Serve the MPD file
  app.get('/stream/:folderName', async (req, res) => {
    const folderName = req.params.folderName;
    const mpdFilePath = `${folderName}/output.mpd`;
  
    try {
      const mpdUrl = cloudinary.url(mpdFilePath, { resource_type: 'raw' });
      res.redirect(mpdUrl);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching MPD file');
    }
  });
  
  // Serve the video segments
  app.get('/stream/:folderName/:segment', async (req, res) => {
    const folderName = req.params.folderName;
    const segment = req.params.segment;
    const segmentFilePath = `${folderName}/${segment}`;
  
    try {
      const segmentUrl = cloudinary.url(segmentFilePath, { resource_type: 'raw' });
      res.redirect(segmentUrl);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching video segment');
    }
  });