const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: '',
    api_key: '',
    api_secret: '-PfMWIqI_6XhE'
});

// Function to upload a file to Cloudinary
const uploadFile = (filePath, folder) => {

    // const filePath = '/path/to/your/file.txt';
    const fileName = path.basename(filePath);
    
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, {
            public_id: fileName,
            resource_type: 'raw',
            folder: folder
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to upload all files in a folder to Cloudinary
const uploadFolder = async (folderPath) => {
    const folderName = path.basename(folderPath);
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (fs.lstatSync(filePath).isFile()) {
            try {
                const result = await uploadFile(filePath, folderName);
                console.log(`Uploaded ${file} to Cloudinary: ${result.secure_url}`);
            } catch (error) {
                console.error(`Error uploading ${file}:`, error);
            }
        }
    }
};

// Path to your MPD video folder
const mpdFolderPath = path.join(__dirname, 'oggy2Dash');

// Upload the folder
uploadFolder(mpdFolderPath)
    .then(() => {
        console.log('All files uploaded successfully');
    })
    .catch((error) => {
        console.error('Error uploading folder:', error);
    });

// getName = ()=>{
//     const filePath = '/path/to/your/file.txt';
//     const fileName = path.basename(filePath);

//     console.log(fileName); // Outputs: 'file.txt'
// }

// getName()
