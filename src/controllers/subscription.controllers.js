import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiErrors } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(
            400, 
            "Invalid Channel Id"
        )
    }

    const Channel = await User.findById(channelId)

    if(!Channel){
        throw new ApiError(
            400,
            "Channel Not Found"
        ) 
    }

    if(Channel._id.toString() === req.user?._id.toString()){
        throw new ApiErrors(
            400,
            "You cannot subscribe to your own Channel"
        )
    }

    const channelAlreadySubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channel._id
    })

    if(channelAlreadySubscribed){
        await Subscription.findByIdAndDelete(channelAlreadySubscribed);

        return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                "Channel unsubscribed"
            )
        )
    } else {
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channel._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Channel Subscribed successfully"
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(
            400,
            "Invalid Channel ID"
        )
    }

    const ChannelSubs = await Subscription.aggregate([
        {
            $match: {
                channelId: new mongoose.Types.ObjectId( channelId )
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $project: {
                subscriber: {
                    _id: 1,
                    username: 1,
                    email: 1
                }
            }
        }
    ])

    if(ChannelSubs.length === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                ChannelSubs,
                "No Subscribers"
            )
        )
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            ChannelSubs,
            "Channel Subscriber"
        )
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const Subscribers = await Subscription.aggregate([
        {
            $match: {
                subscriberId: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "user",
                localField: "channelId",
                foreignField: "_id",
                as: "subscribedChannel"
            }
        },
        {
            $project: {
                subscribedChannel:{
                    _id: 1,
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    coverImage : 1,
                }
            }
        }
    ])

    if (!subscribedChannels.length) {
        throw new apiError(404, "No channels subscribed");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201, 
            Subscribers
        )
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}