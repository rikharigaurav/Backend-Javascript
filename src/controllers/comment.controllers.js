import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiErrors} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video[]
    const { content, video, owner } = req.body

    if([content, video, owner].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const comment = await Comment.create({
        content,
        video, 
        owner
    })

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

    if(!content) {
        throw new ApiError(400, "All fields are required")
    }

    const commment = await Comment.findByIdAndUpdate(
        req.comment?._id, 
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
    await Comment.findByIdAndDelete(
        req.user._id,
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
