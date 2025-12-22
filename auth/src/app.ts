import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session';

import { currrentUserRouter, healthCheckRouter, signinUserRouter, signoutUserRouter, signuptUserRouter } from './routes';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    // Only mark cookies secure in production (allows local development over HTTP)
    secure: process.env.NODE_ENV === 'production',
}))
app.use(healthCheckRouter)
app.use(currrentUserRouter);
app.use(signinUserRouter);
app.use(signoutUserRouter);
app.use(signuptUserRouter);
app.all('*', ()=> {
    throw new NotFoundError();
})
app.use(errorHandler);

export { app }
