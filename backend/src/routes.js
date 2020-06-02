import express from 'express';

const routes = express.Router();

routes.get('/', (req, res) => {
    return res.json({ text: "Hello NLW!" })
});

export default routes;