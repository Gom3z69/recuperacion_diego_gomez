import dotenv from "dotenv";

dotenv.config()

export const config ={
    db:{
        URI:process.env.DB_URI
    },
    server:{
        port:process.env.PORT
    },
    JWT:{
        secret:process.env.JWT_SECRET_KEY
    },
    email:{
        user_email:process.env.USER_EMAIL,
        user_password:process.env.USER_PASSWORD
    },
    cloudinary:{
        cloudinary_name:process.env.CLOUDINARY_CLOUD_NAME,
        cloudinary_api_key:process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret:process.env.CLOUDINARY_API_SECRET
    }
};