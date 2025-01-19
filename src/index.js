import express from "express";
import { config } from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser'
import router from "./routes/otpRoutes.js";
import agencyrouter from "./routes/agencyRoutes.js";
import userrouter from "./routes/userRoutes.js";
import authrouter from "./routes/authRoute.js"
//const otpRoutes = require('./routes/otpRoutes');
//const userRoutes = require('./routes/userRoutes');
//import { userRoutes } from "./routes/userRoutes.js"
//const userRoutes = require('./routes/userRoutes');

//dotenv.config();
//import ArticleRouter from "./routes/ArticleRoute.js";
//import UserRouter from "./routes/userRoute.js";
//import {eurekaClient} from ".config/eurekaClient.js"
//const eurekaClient = require('./config/eurekaClient.js');
//const esClient = require('./config/elasticsearch.js')

const app = express();

config();

i18n.configure({
  locales: ['en'],             // Supported languages
  directory: './locales',    // Path to the translation files
  defaultLocale: 'en',       // Default language
  queryParameter: 'lang',   // Optional query parameter for language
  objectNotation: true     // Enable nested keys in translation files
});  

app.use(i18n.init);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

app.use(express.json()); 

app.use('/api/v1/otp', router);
app.use('/api/v1/auth', router);
app.use('/api/v1/user', userrouter);
app.use('/api/v1/auth', authrouter);
app.use('/api/v1/', userrouter);
app.use('/api/v1/agency', agencyrouter)
//app.use('/api/user', userRoutes);
//app.use("/api/v1/article", ArticleRouter);
//app.use("/api/v1/user", UserRouter);

const PORT =  process.env.PORT || 3002;
//const server = http.createServer(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



