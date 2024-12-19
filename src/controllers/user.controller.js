import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
        // get users detail from frontend
        // validation
        // check if user already exists: username , email
        // check for images and check for avatar
        // upload them to cloudinary,avatar
        // create user object- create entry in db 
        // remove password and refresh token field from response 
        // check for user creation 
        // return response if user created if not send error message




        const {fullName, email, username, password} = req.body
        console.log("email:", email);

        if(
            [fullName, email, username, password].some((field) => 
                field?.trim() === "")
        ){
            throw new ApiError(400, "Please provide all the required fields")
        }

        const existedUser = User.findOne({
            $or: [{email}, {username}]
        })
        if(existedUser){
            throw new ApiError(409, "User with email or username already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400, "Please provide an avatar image")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar || !coverImage){
            throw new ApiError(500, "Failed to upload image on cloudinary")
        }

        const user = await User.create({
            fullName,
            email,
            username: username.toLowerCase(),
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",

        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        if(!createdUser){
            throw new ApiError(500, "Something went wrong failed to create user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
        

        
}
)

export {
    registerUser,
}
