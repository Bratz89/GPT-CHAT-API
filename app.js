require('dotenv').config()
var express = require("express")
var cors = require('cors')
var app = express()

var corsOptions = {
    "origin": function (origin, callback) {
        const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    "methods": "GET,POST",
    "allowedHeaders": ["Content-Type", "Authorization", "Prompt"],
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

app.use(cors(corsOptions));

app.get('/', function (req, res) {
    console.log("****** Wasabeee! ******")
    res.send("Wasabeee!");
})

app.post('/ai', async function (req, res) {
    console.log("****** New AI request ******")
    console.log(req.headers.prompt)
    if (req.headers.prompt) {
        const { Configuration, OpenAIApi } = require("openai");
        const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, });
        const openai = new OpenAIApi(configuration);

        const promt = JSON.parse(req.headers.prompt)
        console.log(promt)

        try {
            let GPT35Turbo = async (message) => {
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: message,
                    max_tokens: 512,
                });
                console.log("RESPONSE", response.data.choices);
                return (response.data)
            };
            res.send(await GPT35Turbo(promt))
        } catch (error) {
            console.log("GPT35Turbo ERROR", error.response.data.error.code)
            if (error.response.data.error.code === "invalid_api_key") {
                res.send({ "error": "invalid_api_key" })
            }
            else {
                res.send({ "error": error.response.data.error.message })
            }
        }
    }
    if (!req.headers.prompt) {
        res.send({ "error": "no data recieved" })
        console.log("error: no data recieved")
    }
})
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`App listening on port ${port}!`));
