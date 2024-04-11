import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { ApiErrors } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const { videoId } = req.params;
    //TODO: create playlist

    if(!(name || description)){
        throw new ApiErrors(
            400,
            "Playlist Name and Description requried"
        )
    }

    if(!isValidObjectId(videoId)){
        throw new ApiErrors(
            400,
            "Video not Available"
        )
    }


    if(videoId){
        const playlist = await Playlist.create({
            name,
            description,
            video: videoId,
            owner: req.user._id
        })   
    } else{
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user?._id
    });
    }

    if(!playlist){
        throw new ApiErrors(
            400,
            "Playlist Not Created"
        )
    }


    return res
    .status(200)
    .json(
        200,
        playlist,
        "Playlist Created Successully"
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiErrors(
            400,
            "UserID not valid"
        )
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId( req.user._id )
            }
        }
    ])

    if (playlists.length === 0) {
        return res
            .status(404)
            .json(new ApiResponse(400, playlists, "User has no playlists."));
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                playlists, 
                "Playlists fetched successfully."
            )
    );


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiErrors(400, "Invalid playlist");
    }

    const playlist = await Playlist.findbyId(playlistId);

    if(!playlistId){
        throw new ApiErrors(
            400,
            "Playlist Not found"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                playlists, 
                "Playlists fetched successfully."
            )
    );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiErrors(
            400,
            "Invalid Playlist or video"
        )
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiErrors(
            400, 
            "Playlist not found"
        );
    }

    if (!video) {
        throw new ApiErrors(
            400, 
            "Video not found"
        );
    }
 
    let addvideo;
    if(playlist.owner.toString() === req.user._is.toString()){
        addvideo = await Playlist.findByIdAndUpdate(
            playlistId, 
            {
                $addToSet: {
                    videos: videoId,
                },
            }, { new: true }
        );
    } else {
        throw new ApiErrors(
            400,
            "Unauthorized access to playlist"
        )
    }

    if(!addvideo){
        throw new ApiErrors(
            400,
            "Something went wrong"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video Added Successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new ApiErrors(400, "Invalid Playlist or video");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiErrors(400, "Playlist not found");
    }

    if (!video) {
        throw new ApiErrors(400, "Video not found");
    }

    let deleteVideo;
    if (playlist.owner.toString() === req.user._is.toString()) {
        deleteVideo = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull: {
                    videos: videoId,
                },
            },
            { new: true }
        );
    } else {
        throw new ApiErrors(
            400, 
            "Unauthorized access to playlist"
        );
    }

    if(!deleteVideo){
        throw new ApiErrors(
            400,
            "Couldn't Delete Video. Try Again"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video removed from playlist"
        )
    )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiErrors(
            400,
            "Invalid Playlist ID"
        )
    }

    const deletePlaylist = await Playlist.findById(
        playlistId
    )

    if(deletePlaylist.owner.toString() === req.user._id.toString()){
        await Playlist.findByIdAndDelete(
            playlistId
        )
    } else {
        throw new ApiErrors(
            400,
            "Unauthorized access to playlist"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Playlist Deleted Successfully"
        )
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiErrors(
            400,
            "Invalid Playlist ID"
        )
    }

    if(name.trim() === "" || description.trim() === ""){
        throw new ApiErrors(
            400,
            "Name or Description required to Update"
        )
    }

    const update = await Playlist.findById(playlistId);

    if(!playlistId){
        throw new ApiErrors(
            400,
            "No playlist found"
        )
    }

    if(update.owner.toString() === req.user._if.toString()){
        await playlist.findByIdAndUpdate(
            playlistId,
            {
                $set: {
                    name: name,
                    description: description
                }
            }, { new: true }
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            update,
            "Playlist Upadated Successfully"
        )
    )
})
 
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
