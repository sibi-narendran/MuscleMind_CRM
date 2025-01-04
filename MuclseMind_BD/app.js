const express = require("express");
const cors = require("cors");
const httpStatus = require("http-status");
const morgan = require("./src/config/morgan");
const { errorConverter, errorHandler } = require("./src/middlwares/errors");
const bodyParser = require("body-parser");
const ApiError = require("./src/utils/apiError");
const { authLimiter } = require("./src/middlwares/rateLimiter");
const routes = require('./src/routers/v1')


require('./src/utils/cronJobs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(cors());
app.options("*", cors());

app.get("/", (req, res) => {
  res.status(200).send({ message: "CRM BACKEND IS WORKING........" });
});

app.use("/v1", routes);
app.use("/v1/auth", authLimiter);

app.use(errorConverter);

app.use(errorHandler);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

const PORT = process.env.PORT || 3000; // You can specify the port or use an environment variable
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});

module.exports = app;
