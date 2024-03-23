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
const { User, Fingerprint } = require('./models');
const verifyToken = require('./middlewares/auth');
const { FingerprintJsServerApiClient, Region } = require('@fingerprintjs/fingerprintjs-pro-server-api');

const client = new FingerprintJsServerApiClient({
    apiKey: process.env.FP_SERVER_KEY,
    region: Region.AP,
});

app.get('/home', verifyToken, (req, res) => {
    res.json({message: "Welcome!", user: req.user});
});

app.post('/verify', verifyToken, async (req, res) => {
    const { visitor_id } = req.body;
    const user = await User.findOne({ where: { email: req.user.email }, include: Fingerprint });

    const fingerprints = await user.getFingerprints({ where: { visitorId: visitor_id } });

    if(fingerprints.length === 0) {
        return res.status(404).send({ error: 'Fingerprint not found' });
    }

    await fingerprints[0].update({ verified: true});

    res.status(200).send({ verified: true });
});

app.post('/login', async (req, res) => {
    const { email, password, request_id, visitor_id } = req.body;

    if(!visitor_id) {
        return res.status(400).send({ error: 'Visitor ID is required' });
    }

    const event = await client.getEvent(request_id);
    if(event.products?.identification?.data?.visitorId !== visitor_id) {
        return res.status(401).send({ error: 'Visitor ID has been tampered with' });
    }

    if(event.products?.identification?.data?.incognito) {
        return res.status(401).send({ error: 'Incognito mode detected' });
    }

    const user = await User.findOne({ where: { email }, include: Fingerprint });
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

    const fingerprints = await user.getFingerprints({ where: { visitorId: visitor_id } });

    let verified = false;
    if(fingerprints.length === 0) {
        await user.createFingerprint({ visitorId: visitor_id });
    } else {
        verified = fingerprints[0].verified;
    }

    delete user.dataValues.password;
    res.status(200).send({ ...user.dataValues, token, verifiedDevice: verified });
});

app.post('/register', async (req, res) => {
    const { email, password, password_confirm, visitor_id } = req.body;
    if (password !== password_confirm) {
        return res.status(400).send({ error: 'Passwords do not match'});
    }

    if(!visitor_id) {
        return res.status(400).send({ error: 'Visitor ID is required' });
    }

    const user = await User.findOne({ where: { email }});
    if (user) {
        return res.status(400).send({ error: 'User already exists' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    try {
        const user = await User.create({ 
            email, 
            password: hash,
            Fingerprints: [{ visitorId: visitor_id, verified: true }]
        }, {
            include: [{ association: User.hasMany(Fingerprint) }]
        });
        res.status(201).send({ error: null, user: { email } });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
