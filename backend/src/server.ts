import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`[server] Link Gallery API listening on port ${env.PORT}`);
});
