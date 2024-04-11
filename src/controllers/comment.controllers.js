import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiErrors} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiErrors(
            400,
            "Invalid video Id"
        )
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiErrors(
            400,
            "Video Not Found"
        )
    }

    const comment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }, 
        {
            $lookup: {
                from: "user",
                localField: "owner",
                foreignField: "_id",
                as: "commentOwner"
            }
        }, {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "commentlikes"
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
            }
        }
    ])

    if(!comment){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Video Comment Fetched Successfully"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Video Comment Fetched Successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video[]
    const { content } = req.body
    const { videoId } = req.params

    if (content === "") {
        throw new ApiErrors(
            400, 
            "Content is required."
        );
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiErrors(
            400, 
            "Invalid videoId"
        );
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiErrors(
            400, 
            "Video not found"
        );
    }

    const comment = await Comment.create({
        content,
        video: video._id, 
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiErrors(
            400,
            "Coudn't create Comment"
        )
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdComment,
            "Comment created Successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params;

    if(!isValidObjectId(commentId)) {
        throw new ApiErrors(
            400, 
            "Invalid commentId"
        );
    }


    if(!content) {
        throw new ApiErrors(
            400, 
            "Content is required"
        )
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId, 
        {
            $set: {
                content: content,
            }
        }, 
        { new: true }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            201, 
            comment,
            "Comment Updated Successfully"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params;

    if (!isValidObjectId(commentId)) {
      throw new ApiErrors(
        400, 
        "Invalid commentId"
    );
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Comment Deleted Successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
