import express from "express";
import http from "http";
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import ArticleRouter from "./routes/ArticleRoute.js";
import UserRouter from "./routes/userRoute.js";
const eurekaClient = require('./config/eurekaClient.js');
const esClient = require('./config/elasticsearch.js')

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

app.use(express.json());
app.use("/api/v1/article", ArticleRouter);
app.use("/api/v1/user", UserRouter);

const PORT =  process.env.PORT || 3002;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("server started");
});



