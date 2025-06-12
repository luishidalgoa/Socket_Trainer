import mongoose from "mongoose";

const user_token_mongoose = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    token: {
        type: String,
        required: false,
        unique: true,
    },
    refresh_token: {
        type: String,
        required: false,
        unique: true,
    }
})

export default mongoose.model("UserToken", user_token_mongoose);