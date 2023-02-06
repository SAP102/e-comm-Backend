const app = require('./App')
const dotenv = require('dotenv')
const cloudinary = require('cloudinary')
const connectDatabase = require('./database')

dotenv.config({ path: "config/config.env" })

connectDatabase()

cloudinary.config({
    cloud_name: 'do0i5mp1f',
    api_key: '736978174327139',
    api_secret: 'BRAlvCVG56J1TLeG3WD5PPI3KVA'
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on ${process.env.PORT}`)
})

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandeled Promis Rejection`);

    server.close(() => {
        process.exit(1);
    });
});