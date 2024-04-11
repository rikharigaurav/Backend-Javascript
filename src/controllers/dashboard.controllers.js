import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { ApiErrors } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channel = await User.findById(req.user?.id)

    if(!channel){
        throw new ApiErrors(
            400,
            "Channel Not Found"
        )
    }

    const Stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channel._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "video_likes"
            }
        }, 
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: " channel",
                as: "total_subscribers"
            }
        },
        {
            $group: {
                TotalView: {
                    $sum: "$views"
                },
                TotalVideo: {
                    $sum: 1
                },
                TotalSubscribers: {
                    $first: {
                        $size: "$total_subscribers"
                    }
                },
                TotalLikes: {
                    $first: {
                        $size: "$video_likes"
                    }
                }
            }
        },
        {
            $project: {
                TotalVideos: 1,
                TotalSubscribers: 1,
                TotalViews: 1,
                TotalLikes: 1,
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            Stats,
            "Channel Stats Fetched Successfully"
        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const channel = await User.findById(req.user?._id)

    if(!channel){
        throw new ApiErrors(
            400,
            "Channel Not Found"
        )
    }

    const channelVideo = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channel._id)
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
            }
        }
    ])

    if(!channelVideo.length){
        throw new ApiErrors(
            400,
            "No videos found"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channelVideo,
            "Channel Video Fetched Successfully"
        )
    )


})

export {
    getChannelStats, 
    getChannelVideos
    }