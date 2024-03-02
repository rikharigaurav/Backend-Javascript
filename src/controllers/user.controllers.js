import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
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

    const { fullName, email, username, password } = res.body
    console.log("email:", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "") 
    ){
        throw new ApiErrors(400, "All fields are required")
    }

    const exsitedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(exsitedUser){
        throw new ApiErrors(409, "User with email or username already existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

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

export { registerUser }
