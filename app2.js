const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dfshwcvxu',
    api_key: '171136177283262',
    api_secret: '-PfMWe3k0EH5AJi1EyiIqI_6XhE'
});

// Function to delete a single asset
// const deleteAsset = (publicId) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }, (error, result) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// };

const deleteAsset = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type: "raw" }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};


// Function to delete all assets in a folder
const deleteFolder = async (folderPath) => {
    try {
        const { resources } = await cloudinary.search
            .expression(`folder:${folderPath}`)
            .execute();
        
        for (const resource of resources) {
            try {
                const result = await deleteAsset(resource.public_id);
                console.log(`Deleted ${resource.public_id}:`, result);
            } catch (error) {
                console.error(`Error deleting ${resource.public_id}:`, error);
            }
        }
        console.log(`All assets in folder ${folderPath} deleted successfully`);
    } catch (error) {
        console.error('Error fetching assets:', error);
    }
};

// Specify the folder you want to delete
const folderToDelete = 'oggy_Dash';

// Delete the folder
deleteFolder(folderToDelete);
