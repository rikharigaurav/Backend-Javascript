import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { ApiErrors } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if(content?.trim() === ""){
        throw new ApiErrors(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.userId
    })

    if(!tweet) {
        throw new ApiErrors(
            400,
            "Something Went Wrong"
        )
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            "Tweet created successfully",
            tweet
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(tweets.length === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "User has No Tweets"
            )
        )
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            "Tweets fetched successfully",
            tweets
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body;
    const { tweetId } = req.params; 

    if(!content){
        throw new ApiErrors(
            400,
            "Content required to Upadate"
        )
    }

    const UpdateTweet = await Tweet.findByIdAndUpdate(
        tweetId ,
        {
            $set: {
                content,
                updatedAt: new Date()
            }
        },
        {
            new: true
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            UpdateTweet,
            "Tweet updated Successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            "Tweet Deleted Successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
