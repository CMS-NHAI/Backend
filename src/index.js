import express from "express";
import { config } from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser'
import router from "./routes/otpRoutes.js";
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

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

app.use(express.json()); 

app.use('/api/otp', router);
//app.use('/api/user', userRoutes);
//app.use("/api/v1/article", ArticleRouter);
//app.use("/api/v1/user", UserRouter);

const PORT =  process.env.PORT || 3003;
//const server = http.createServer(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



