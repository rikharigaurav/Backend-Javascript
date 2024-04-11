import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { ApiErrors } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiErrors(
            400,
            "Invalid Video Id"
        )
    }

    const VideoAlreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if(VideoAlreadyLiked){
        await Like.findByIdAndDelete(VideoAlreadyLiked._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                "Channel UnLiked"
            )
        )
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video Liked Successfully"
        )
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiErrors(
            400,
            "Invalid Comment Id"
        )
    }

    const commentLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(commentLiked){
        await Like.findByIdAndDelete(commentLiked._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Comment Unliked Successfully"
            )
        )
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "Comment Liked Successfully"
        )
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiErrors(
            400,
            "Invalid Tweet Id"
        )
    }

    const tweetLiked = await Like.findOne({
        likedBy: req.user?._id,
        tweet: tweetId
    })

    if(tweetLiked){
        await Like.findByIdAndDelete(tweetLiked._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet Unliked Successfully"
            )
        )
    } else {
        await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "Tweet Liked Successfully"
        )
    )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const LikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: {
                    $exists: true
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo"
            }
        },
        {
            $project: {
                LikedVideo: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    owner: 1
                }
            }
        }
    ])

    if(!LikedVideos?.length){
        throw new ApiErrors(
            400,
            "User has no liked videos"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "User liked videos Fetched Successfully",
            LikedVideos
        )
    )


})  


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}