require("dotenv").config();
const cors = require("cors");
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";

AppDataSource.initialize()
  .then(async () => {
    const app = express();

    const PORT = process.env.PORT;
    const HOST = process.env.HOST;

    app.use(bodyParser.json());
    app.use(cors());

    Routes.forEach((route) => {
      const middleware = route.middleware || [];
      (app as any)[route.method](
        route.route,
        ...middleware,
        (req: Request, res: Response, next: Function) => {
          console.log(route);
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    app.listen(PORT, HOST, () => {
      console.log(`Express server has started on http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
