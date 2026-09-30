import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: {type: String},
        lastname: {type: String},
        email: {type: String},
        password: {type: String},
        phone: {type: String},
        birthdate: {type: Date},
        profilePicture: {type: String},
        cloudinaryPublicId: {type: String},
        verificationCode: {type: String},
        expirationCode: {type: Date},
        isVerified: {type: Date}
    },{
        timestamps: true,
        strict: false
    }
);

export default model("User", userSchema);