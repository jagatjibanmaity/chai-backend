import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async (req, res) => {
    //get user detail from frontend
    //validation - not empty 
    //check if user already exists : email,username
    //check for images
    //check for avtar
    //upload them to cloudinary,avtar
    //create user object - create entry in db
    // remove password and refresh token field from response
    //check for user creation
    //return response


    const { username, email, password,fullname } = req.body;
     console.log("email :",email);

     if(
        [fullname,username,email,password].some((field)=>field?.trim() === "")
     ){
        throw new ApiError(400,"all fields are required");
        
     }

      const existedUser =User.findOne({
        $or : [
            {email},
            {username}
        ]
     })

        if(existedUser){
            throw new ApiError(409,"user with email or username already exists");
        }

        const avatarLocalPath =req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,"avatar is required");
        }

        const avatar =await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar){
            throw new ApiError(400 ,"Avatar file is required");
        }

        const user = await User.create({
            fullname,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            username : username.toLowerCase(),
            password
        })


         const createdUser =    await User.findById(user._id).select(
            "-password -refreshToken"
         )

         if(!createdUser){
            throw new ApiError(500,"something went wrong while registering user");
         } 


         return res.status(201).json(new ApiResponse(201, createdUser,"user registered  successfully"));
})



export { registerUser } ;