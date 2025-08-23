import express from 'express'

const router = express.Router()

router.get('/api/users/health', (req, res) => {
    res.status(200).send({message: 'I am healthy'})
})

export { router as healthCheckRouter }
