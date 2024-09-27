import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import mongoose from 'mongoose';

import { currrentUserRouter, signinUserRouter, signoutUserRouter, signuptUserRouter } from './routes';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
const app = express();

app.use(json());
app.use(currrentUserRouter);
app.use(signinUserRouter);
app.use(signoutUserRouter);
app.use(signuptUserRouter);
app.all('*', ()=> {
    throw new NotFoundError();
})
app.use(errorHandler)

const start = async()=> {
    try{
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth')
        console.log('Connected to MongoDB')
    }catch(err) {
        console.error(err)
    }
    app.listen(3000, ()=> console.log('app is running on port :!!!! ', 3000))
}

start();

