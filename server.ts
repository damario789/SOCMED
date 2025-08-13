import dotenv from "@dotenvx/dotenvx";
import app from "./src/app";
dotenv.config();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});