import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import  User  from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


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

      const existedUser = await User.findOne({
        $or : [
            {email},
            {username}
        ]
     })

        if(existedUser){
            throw new ApiError(409,"user with email or username already exists");
        }

        console.log("Received Files:", req.files);  // Check what files are received
        console.log("Received Body:", req.body);    // Check if body fields are correct
        

        const avatarLocalPath =req.files?.avatar[0]?.path || null;
       // const coverImageLocalPath = req.files?.coverImage[0]?.path;


         

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        
        if(!avatarLocalPath){
            throw new ApiError(400,"avatar is required");
        }

      

        const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

        

        const user = await User.create({
            fullname,
            avatar :avatar ? avatar.url : null,
            coverImage : coverImage? coverImage.url : "",
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



    const loginUser = asyncHandler(async (req, res) => {
        // get data from request body
        //username or email 
        // find the user
        // check password
        //access and refresh token
        // send cookies
        

        const {email,username,password}= req.body

        if(!email && !username){
            throw new ApiError(400,"email or username is required");
        }


         const user= await User.findOne({
            $or : [{email},{username}]
        })

        if(!user){
            throw new ApiError(404,"user not found");
        }

      const ispasswordValid =await user.isPasswordCorrect(password);

      if(!ispasswordValid){
        throw new ApiError(401,"invalid password");
      }


      const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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



 const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
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
    .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET    
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})






export { registerUser, loginUser,logoutUser,refreshAccessToken } ;