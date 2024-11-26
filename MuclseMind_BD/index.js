const app = require("./app");
const config = require("./src/config/config");
const logger = require("./src/config/logger");

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let server;

const connectSupabase = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      logger.error("Connection error...", error);
    } else {
      logger.info("Supabase is connected....", data);
      server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
      });
    }
  } catch (error) {
    logger.error("Connection error...", error);
  }
};

connectSupabase();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
