import { APP_API_PREFIX } from "@/config/env";
import { AppError } from "@/exceptions/app-error";
import { BackgroundServiceManager } from "@/modules/common/services/background-service-manager";
import * as bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { createServer, Server } from "http";
import { errorHandler } from "@/exceptions/error-handler";
import express, { Request, Response, NextFunction, Application } from "express";
import { HttpCorsOptions } from "@/config/cors";
import { inject, injectable } from "inversify";
import { logger } from "@/libs/logger";
import path from "path";
import rateLimit from "express-rate-limit";
import { Routes } from "@/presentation/routes";
import { sequelizeMigrate } from "@/modules/common/sequelize";
import TYPES from "@/types";

@injectable()
export class Bootstrap {
  public app: Application;
  public httpServer: Server;

  constructor(
    @inject(Routes) private appRoutes: Routes,
    @inject(TYPES.BackgroundServiceManager)
    private backgroundServiceManager: BackgroundServiceManager
  ) {
    this.app = express();
    this.httpServer = createServer(this.app);

    this.middleware();
    this.setRoutes();
    this.middlewareError();
    this.initializeDatabase();
    this.initializeBackgroundServices();
  }

  private middleware(): void {
    this.app.use(cors(HttpCorsOptions));
    this.app.options('*', cors(HttpCorsOptions));

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    this.app.use(express.static(path.join(__dirname, '../../public')));

    const apiRateLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        message: 'Too many requests, please try again later.',
      },
      skip: (req) => req.method === 'OPTIONS',
    });

    this.app.use(APP_API_PREFIX, apiRateLimiter);

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.removeHeader('X-Powered-By');

      const clientIp =
        (req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        'unknown';

      console.log(
        `${req.method} url:: ${req.url} from ip:: ${clientIp} origin:: ${
          req.headers.origin ?? 'none'
        }`
      );

      next();
    });
  }

  private setRoutes(): void {
    const router = express.Router();

    this.app.use(APP_API_PREFIX, router);
    this.appRoutes.setRoutes(router);

    router.get('/health-check', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        message: 'Server is up and running',
      });
    });

    this.app.use(
      '/storage',
      express.static(path.join(process.cwd(), './storage'))
    );
  }

  private middlewareError(): void {
    const invalidPathHandler = (_req: Request, res: Response) => {
      res.status(404).json({ message: 'route not found' });
    };

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
}
