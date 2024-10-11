import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError, RequestValidationError } from '../errors';
import Jwt  from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters')
], async(req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array())
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({email})
    if (existingUser) {
        console.log('Email in use')
        throw new BadRequestError('Eamil in use');
    }
    const user = User.build({email, password});
    await user.save();

    // Generate JWT payload and signing key.
    const userJwt = Jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);

    // Store it on sessio object
    req.session = {
        jwt: userJwt
    }
    res.status(201).send({user});

});

export default router;


// throw new Error('Invalid email or password');
// return res.status(400).json({ errors: errors.array() });
// throw new Error('Error connecting to Database');
// res.send("Hello buddy signup");