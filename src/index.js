import express from "express";
import i18n from 'i18n';
import { config } from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser'
import router from "./routes/otpRoutes.js";
import agencyRoutes from "./routes/agencyRoutes.js";
import userrouter from "./routes/userRoutes.js";
import {STATUS_CODES} from "./constants/statusCodesConstant.js"
import {APP_CONSTANTS}  from "./constants/appConstants.js"

import rolerouter from "./routes/keycloak/roleRoute.js";
import scoperouter from "./routes/keycloak/scopeRoute.js";
import resourcerouter from './routes/keycloak/resourceRoute.js';
import policyrouter from './routes/keycloak/policyRoute.js'
import keycloakUserRouter from './routes/keycloak/userRoute.js'
import authrouter from "./routes/authRoute.js"
import keycloakAuthRoute from './routes/keycloak/keycloakAuthRoute.js'
import path from "path";
import { fileURLToPath } from 'url';
import { sendOtpSMS } from "./services/cdacOtpService.js";

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

app.use(express.json({ limit: '150kb' })); 

app.use('/api/v1/otp', router);
app.use('/api/v1/auth', router);
app.use('/api/v1/user', userrouter);
app.use('/api/v1/', userrouter);
app.use('/api/v1/agencies', agencyRoutes)

// keycloak route
app.use('/api/v1/role', rolerouter);
app.use('/api/v1/scope', scoperouter);
app.use('/api/v1/resource', resourcerouter);
app.use('/api/v1/policy', policyrouter);
app.use('/api/v1/keycloak/user', keycloakUserRouter);
app.use('/api/v1/auth', authrouter);
app.use('/api/v1/keycloak/auth', keycloakAuthRoute)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.sendFile(path.join(__dirname, "public/.well-known/assetlinks.json"));
});

//app.use('/api/user', userRoutes);
//app.use("/api/v1/article", ArticleRouter);
//app.use("/api/v1/user", UserRouter);

// send otp start
app.post('/send-otp', async (req, res) => {
  try {
    const {mobileno} = req.body
    const otpResponse = await sendOtpSMS(mobileno);
    res.status(200).send(otpResponse);
  } catch (error) {
    res.status(500).send('Failed to send OTP');
  }
});
// send otp end

app.get('/', (req, res) => {
  res.status(STATUS_CODES.OK).send({
    message: `Welcome to Datalake 3.0 ${APP_CONSTANTS.APP_NAME} v${APP_CONSTANTS.VERSION}`,
  });
});

const PORT =  process.env.PORT || 3004;
//const server = http.createServer(app);

app.listen(3004, '0.0.0.0',() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



