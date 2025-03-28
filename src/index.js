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
// for test cases start
import uccRouter from './routes/testCases/uccRoute.js'
import roadSafetyAuditRouter from './routes/testCases/roadSafetyAuditRoute.js'
import tollMasterRouter from './routes/testCases/tollMasterRoute.js'
import piuRouter from './routes/testCases/piuRoute.js'
// for test cases end
import path from "path";
import { fileURLToPath } from 'url';
import { sendOtpSMS, sendOtpSMSForInvite } from "./services/cdacOtpService.js";
import sendEmailRoute from "./routes/sendEmailRoutes.js"

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
app.use(compression());
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: "10mb" }));

//app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// for testing purpose
app.post('/backend/auth/api/v1/send-otp', async(req, res)=>{
  try{
    const data = await sendOtpSMS(req.body.mobileno)
    res.status(200).json({ message:'OTP send successfully!', data:data})
  }catch(error){
    res.status(500).json({ success:false, message:error.message})
  }
   
});

app.use('/backend/auth/api/v1/otp', router);
app.use('/backend/auth/api/v1/email', sendEmailRoute);
app.use('/backend/auth/api/v1/auth', router);
app.use('/backend/auth/api/v1/user', userrouter);
app.use('/backend/auth/api/v1/', userrouter);
app.use('/backend/auth/api/v1/agencies', agencyRoutes)

// keycloak route
app.use('/backend/auth/api/v1/role', rolerouter);
app.use('/backend/auth/api/v1/scope', scoperouter);
app.use('/backend/auth/api/v1/resource', resourcerouter);
app.use('/backend/auth/api/v1/policy', policyrouter);
app.use('/backend/auth/api/v1/keycloak/user', keycloakUserRouter);
app.use('/backend/auth/api/v1/auth', authrouter);
app.use('/backend/auth/api/v1/keycloak/auth', keycloakAuthRoute)

// For case test Case router start 
app.use('/backend/auth/api/v1/ucc', uccRouter);
app.use('/backend/auth/api/v1/roadSafetyaudit', roadSafetyAuditRouter);
app.use('/backend/auth/api/v1/tollmaster', tollMasterRouter)
app.use('/backend/auth/api/v1/piu', piuRouter)
// For case test Case router end 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.sendFile(path.join(__dirname, "public/.well-known/assetlinks.json"));
});

app.get("/.well-known/apple-app-site=association.json", (req, res) => {
  res.sendFile(path.join(__dirname, "public/.well-known/apple-app-site=association.json"));
});



//app.use('/api/user', userRoutes);
//app.use("/api/v1/article", ArticleRouter);
//app.use("/api/v1/user", UserRouter);

app.get('/backend/auth', (req, res) => {
  res.status(STATUS_CODES.OK).send({
    message: `Welcome to Datalake 3.0 ${APP_CONSTANTS.APP_NAME} v${APP_CONSTANTS.VERSION}`,
  });
});

const PORT =  process.env.PORT || 3004;
//const server = http.createServer(app);

app.listen(3004, '0.0.0.0',() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
