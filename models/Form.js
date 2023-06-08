import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const Schema = new mongoose.Schema({
    userId: {
        // mengambil user id dari relasi User.js
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    questions: {
        type: Array
    },
    invites: {
        // ['admin@gmail.com', 'raizhardi@gmail.com']
        type: Array, 
    },
    public: {
        // true = public, false = private
        type: Boolean, 
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    }
},
{
    timestamps: {
        currentTime: () => Math.floor(Date.now() / 1000)
    }
});

Schema.plugin(mongoosePaginate);

Schema.virtual('answers', {
    ref: 'Answer', // Nama model yang ingin di relasikan
    localField: '_id', // _id yang ada di model form
    foreignField: 'formId', // formId yang ada di model answer
});

export default mongoose.model('Form', Schema);
