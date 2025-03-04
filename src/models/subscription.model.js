import mongoose,{Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type : Schema.Types.ObjectId,// who is subscribing
        ref : "User",
    },
    channel:{
        type : Schema.Types.ObjectId,// who is being subscribed to
        ref : "User",
    }
}, {timestamps: true});


// Prevent duplicate subscriptions
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Prevent self-subscription
subscriptionSchema.pre("save", function (next) {
  if (this.subscriber.equals(this.channel)) {
    return next(new Error("You cannot subscribe to yourself."));
  }
  next();
});




export const Subscription = mongoose.model("Subscription", subscriptionSchema);