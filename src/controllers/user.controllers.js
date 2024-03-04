import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Generate Access and Refresh Token 
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false})

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiErrors(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    // Get user detail from user(frontend)
    // validating data given by user - NOT NULL
    // check if user already exists: check through username or email
    // check for images, check for avatar
    // uplaod these files to cloudinary, check avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response and if not send error

    const { fullName, email, username, password } = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "") 
    ){
        throw new ApiErrors(400, "All fields are required")
    }

    const exsitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(exsitedUser){
        throw new ApiErrors(409, "User with email or username already existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiErrors(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiErrors(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    

    if(!createdUser){
        throw new ApiErrors(500, "Something went wrong")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
    
})

const loginUser = asyncHandler(async (req, res) => {

    // Get email and password from User.
    // Validating the data from user NOT NULL.
    // Check if user exists.
    // Check password.
    // Generate Access and Refresh token.
    // Send cookie.

    const {username, email, password} = req.body

    if(!(username || email)){
        throw new ApiErrors(400, "Username or email is required ")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiErrors(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect( password )

    if(!isPasswordValid){
        throw new ApiErrors(401, "Invalid User Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // Send accesstoken and refreshtoken through cookie
    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken ")

    // Cookie can only be modified by the server 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logOutUser = asyncHandler( async(req, res) => {
    // Create a custom middleware for Authentication of the access token
    // Update the refresh token to undefined 

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User Logged Out"
    ))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies?.refershToken || req.body?.refreshToken

    if(!incommingRefreshToken){
        throw new ApiErrors(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id)

    if(!user){
        throw new ApiErrors(401, "Invalid refresh token")
    }

    if(incommingRefreshToken !== user?.refreshToken){
        throw new ApiErrors(401, "Refresh Token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
        new ApiResponse(
            200,
            { accessToken, refreshToken: newrefreshToken }
        ),
        "Access Token refreshed"
    )
})

export { 
    registerUser,
    loginUser,
    logOutUser,
};
