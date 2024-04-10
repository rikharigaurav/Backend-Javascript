import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiErrors } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if(!query.trim()){
        throw new ApiErrors(
            400,
            "Specify Query"
        )
    }

    if(!isValidObjectId(userId)){
        throw new ApiErrors(
            400,
            "Invalid User"
        )
    }


    const user = await User.findById(userId)

    if(!user){
        throw new ApiErrors(
            400,
            "User not found"
        )
    }

    let sort = {};

    if(sortBy && sortType) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1 ;
    }


    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort
    }


    const videoAggregation = Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    const videos = await Video.aggregatePaginate(
        videoAggregation,
        options,
    )
    

    if(videos.totalDocs === 0) { 
        throw new apiError(400, "No videos matched the searched query.")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            Video,
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    
    if(title.trim() === "" || description.trim() === ""){
        throw new ApiErrors(
            400,
            "Title and description are required"
        )
    }

    let videoLocalFile;
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoLocalFile = req.files?.VideoFile[0].path;
    }

    if (!videoLocalPath) {
        throw new apiError(400, "Video file not found.");
    }


    let thumbnailLocalFile;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalFile = req.files?.thumbnail[0].path;
    }

    if (!thumbnailLocalPath) {
        throw new apiError(400, "Thumbnail file not found.");
    }

    const video = await uploadOnCloudinary(videoUrl);
    const thumbnail = await uploadOnCloudinary(thumbnailUrl);

    if(!(video.url || thumbnail.url)){
        throw new ApiErrors(400, "Error while uploading video")
    }

    const Videos = await Video.create({
        title,
        description,
        videoUrl: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        owner: req.user._id,
    })

    if (!Videos) {
      throw new apiError(400, "Something went wrong ");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            Videos,
            "Video Uploaded Successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
      throw new ApiErrors("Something went Wrong");
    }
    const video = await Video.findById(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Fetched Successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body; 
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiErrors("Something went Wrong");
    }

    const thumbnaillocalfile = req.file?.thumbnail[0].path;

    if (!title || !description) {
        throw new apiError(400, "Invalid title or description.");
    }

    if(thumbnaillocalfile) {
        throw new ApiErrors("Thumbnail Not Found");
    }

    const thumbnailUrl = uploadOnCloudinary(thumbnaillocalfile)

    if(!thumbnailUrl.url){
        throw new ApiErrors("Something went wrong");
    }

 
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnailUrl.url
            }
        }, { new: true }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Updated Successfully"
        )
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiErrors(
            400,
            "Something went Wrong"
        )
    }

    const Delete = await Video.findByIdAndDelete(videoId);

    if(!Delete){
        throw new ApiErrors(
            400,
            "No Video Found"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video Deleted Successfully"
        )
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiErrors(
            400,
            "Something went Wrong"
        )
    }

    const Toggle = await Video.findById(videoId);

    if(!Toggle){
        throw new ApiErrors(
            404, 
            "Video Not Found"
        )
    }

    let ToggledVideo;
    if(ToggledVideo.owner.toString() === req.user._id.toString()){
        ToggledVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: !ToggledVideo.isPublished
                }
            },
            { new: true }
        )
    } 

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            ToggledVideo,
            "Toggled Successfully"
        )
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
