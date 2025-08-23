import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties
// that are required to created a new User
interface UserAttrs {
    email: string;
    password: string;
}

// An interface that describes the properties 
// that are User Model has
interface UserModel  extends mongoose.Model<UserDoc>{
    build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document{
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },

},{
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform(doc, ret:any) {
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
} )

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password') ?? '')
        this.set('password', hashed);
    }
    done();
})
userSchema.statics.build = (attrs: UserAttrs)=> {
    return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export  { User }

