import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

/* Approach we will use to upload file on cloudinary:
    step1: bring the file from user and temporary save the file on our server
    step2: upload the file from our server to cloudinary and deleting the temporary file from the server
*/

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //File has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        // console.log(response)
        
        fs.unlinkSync(localFilePath); // Deletes file after it gets uploaded on server
        return response;


    } catch (error) {
        fs.unlinkSync(localFilePath);
        // Removes the saved temporary file as the upload operation got failed
        return null
    }
}


cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
{ public_id: "olympic_flag" }, 
function(error, result) {console.log(result); });

export { uploadOnCloudinary }