import { AnnouncementNamespace } from "@/libs/websocket/namespaces/announcement-namespace";
import { APP_API_PREFIX } from "@/config/env";
import { AppError } from "@/exceptions/app-error";
import { BackgroundServiceManager } from "@/modules/common/background/background-service-manager";
import * as bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import container from "@/container";
import cors from "cors";
import { createServer, Server } from "http";
import { HttpCorsOptions } from "@/config/cors";
import { inject, injectable } from "inversify";
import { DashboardTotalNamespace } from "@/libs/websocket/namespaces/dashboard-total-namespace";
import { errorHandler } from "@/exceptions/error-handler";
import express, { Request, Response, NextFunction, Application } from "express";
import { logger } from "@/libs/logger";
import path from "path";
import rateLimit from "express-rate-limit";
import { Routes } from "@/presentation/routes";
import { RedisClient } from "@/libs/redis/redis-client";
import { sequelizeMigrate } from "@/modules/common/sequelize";
import { SocketIO } from "@/libs/websocket";
import TYPES from "@/types";
import { PUBLIC_TIME_NSP } from "@/libs/websocket/namespaces/constants/namespace-constants";
import { PublicTimeNamespace } from "@/libs/websocket/namespaces/public-time-namespace";

@injectable()
export class Bootstrap {
  public app: Application;
  public httpServer: Server;

  constructor(
    @inject(Routes) private appRoutes: Routes, // inject routes by class
    @inject(TYPES.BackgroundServiceManager) private backgroundServiceManager: BackgroundServiceManager, // inject by symbol
  ) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.initializeRedis();     // initialize redis
    this.middleware();          // apply middleware
    this.setRoutes();           // set routes
    this.middlewareError();     // error handler
    this.initializeDatabase();
    this.initializeBackgroundServices();  // initialize background services
    this.initializeSocketIO();  // initialize socket
  }

  private initializeRedis(): void {
    RedisClient.getInstance();
    console.log('Redis client initialized');
  }

  private middleware(): void {
    const apiRateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,     // 15 minutes
      max: 100,                     // limit each IP to 100 requests per windowMs
      message: {
        status: 429,
        message: "Too many requests, please try again later.",
      },
      standardHeaders: true,        // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false,         // Disable the `X-RateLimit-*` headers
    })

    this.app.use(APP_API_PREFIX, apiRateLimiter);                       // apply rate limiter

    // Handle CORS errors
    this.app.use(cors(HttpCorsOptions));
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof Error && err.message.includes("Blocked by CORS")) {
        console.error(`[${new Date().toISOString()}] ${err.message} for URL: ${req.url}`);
        return res.status(403).json({ error: "CORS policy: origin not allowed" });
      }
      return next(err);
    });

    this.app.use(bodyParser.json());                                    // parse application/json
    this.app.use(bodyParser.urlencoded({ extended: false }));           // parse application/x-www-form-urlencoded
    this.app.use(cookieParser());                                       // parse cookies
    this.app.use(express.static(path.join(__dirname, "../../public"))); // serve static files

    const requestLogger = (
      request: Request,
      response: Response,
      next: NextFunction
    ) => {
      response.removeHeader("X-Powered-By");
      response.header("Access-Control-Allow-Origin", "*");
      response.header(
        "Access-Control-Allow-Headers",
        "content-type, Authorization"
      );
      response.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );

      const clientIp = request.headers["x-forwarded-for"] || request.socket.remoteAddress || 'unknown';
      console.log(`${request.method} url:: ${request.url} from ip:: ${clientIp}`);

      next();
    }

    this.app.use(requestLogger);                                       // request logger
  }

  private setRoutes(): void {
    const router = express.Router();

    this.app.use(APP_API_PREFIX, router);
    this.appRoutes.setRoutes(router);                                   // set all routes

    router.get("/health-check", (_req: Request, res: Response): Response => {
      return res.status(200).json({
        status: "ok",
        message: "Server is up and running",
      });
    });

    this.app.use("/storage", express.static(path.join(process.cwd(), "./storage")));
  }

  private middlewareError(): void {
    const errorLogger = (
      error: AppError,
      _req: Request,
      _res: Response,
      next: NextFunction
    ) => {
      logger.error({
        message: error.message || "Unknown error",
        stack: error.stack,
        details: error,
      });
      next(error);
    };

    const errorResponder = (
      error: AppError,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      errorHandler.handleError(error, res);
    };

    const invalidPathHandler = (_req: Request, response: Response) => {
      response.status(400).json({ message: "route not found" });
    };

    this.app.use(invalidPathHandler);
    this.app.use(errorLogger);
    this.app.use(errorResponder);
  }

  private async initializeDatabase(): Promise<void> {
    await sequelizeMigrate();
  }

  private initializeBackgroundServices(): void {
    this.backgroundServiceManager.startServices();
  }

  public initializeSocketIO(): void {
    const socketIO = container.get<SocketIO>(TYPES.SocketIO);

    socketIO.initialize(this.httpServer);

    // specify public namespace
    socketIO.setPublicNamespaces([
      PUBLIC_TIME_NSP,
    ])

    const socketNamespaces = [
      container.get<DashboardTotalNamespace>(TYPES.DashboardTotalNamespace),
      container.get<AnnouncementNamespace>(TYPES.AnnouncementNamespace),
      new PublicTimeNamespace(),
    ];

    socketIO.initializeNamespaces(socketNamespaces);
    console.log("Socket.IO initialized with namespaces.");
  }
}
