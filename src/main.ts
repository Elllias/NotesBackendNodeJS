import dotenv from "dotenv";
import express, {NextFunction, Request, Response} from "express";
import {initializeNotesRouter} from "./notes/notes.router";
import {PrismaClient} from "@prisma/client";
import {logger} from "./utils/logger";
import {Paths, ErrorMessages} from "./main.types";
import helmet from "helmet";

const app = express();
const prismaClient = new PrismaClient();

async function main() {
    dotenv.config();
    app.use(helmet());
    app.use(express.json());

    initNotesRouter();
    initErrorHandling();

    app.listen(process.env.PORT);
}

const initErrorHandling = () => {
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(`Error occurred: ${err.message}. Stack: ${err.message}`);

        res.status(500).send(ErrorMessages.serverError);
    })

    app.all(/.*/, (req: Request, res: Response) => {
        res.status(404).send(ErrorMessages.notFound);
    });
}

const initNotesRouter = () => {
    const notesRouter = initializeNotesRouter(prismaClient);

    app.use(Paths.notes, notesRouter);
}

main()
    .then(async () => {
        await prismaClient.$connect();
    })
    .catch(async (error: Error) => {
        logger.error(`Error occurred: ${error.message}. Stack: ${error.message}`);

        await prismaClient.$disconnect();
    });