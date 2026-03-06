const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing"
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Conversation", conversationSchema);
