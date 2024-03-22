const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors(
    {
        origin: 'http://localhost:4200'
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require('./models');
const verifyToken = require('./middlewares/auth');

app.get('/home', verifyToken, (req, res) => {
    res.json({message: "Welcome!", user: req.user});
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(401).send({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
        return res.status(401).send({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: 86400
    });

    delete user.dataValues.password;
    res.status(200).send({ ...user.dataValues, token});
});

app.post('/register', async (req, res) => {
    const { email, password, password_confirm } = req.body;
    if (password !== password_confirm) {
        return res.status(400).send({ error: 'Passwords do not match'});
    }
    const user = await User.findOne({ where: { email }});
    if (user) {
        return res.status(400).send({ error: 'User already exists' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    try {
        await User.create({ email, password: hash });
        res.status(201).send({ error: null, user: { email } });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
