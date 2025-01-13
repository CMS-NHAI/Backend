import express from "express";
import i18n from 'i18n';
import { config } from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser'
import router from "./routes/otpRoutes.js";
import userrouter from "./routes/userRoutes.js";
import {STATUS_CODES} from "./constants/statusCodesConstant.js"
import {APP_CONSTANTS}  from "./constants/appConstants.js"


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
app.use('/api/v1/', userrouter);
//app.use('/api/user', userRoutes);
//app.use("/api/v1/article", ArticleRouter);
//app.use("/api/v1/user", UserRouter);

app.get('/', (req, res) => {
  res.status(STATUS_CODES.OK).send({
    message: `Welcome to Datalake 3.0 ${APP_CONSTANTS.APP_NAME} v${APP_CONSTANTS.VERSION}`,
  });
});

const PORT =  process.env.PORT || 3004;
//const server = http.createServer(app);

app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



