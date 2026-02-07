import {Request, Response, Router} from "express";
import {NotesService} from "./notes.service";
import {PrismaClient} from "@prisma/client";
import {RequestsUrls, ErrorMessages} from "./notes.types";
import {logger} from "../utils/logger";

const router = Router();

export const initializeNotesRouter = (prismaClient: PrismaClient): Router => {
    const notesService = new NotesService(prismaClient);

    router
        .post(RequestsUrls.add, createAddNoteRequestHandler(notesService))
        .post(RequestsUrls.get, createGetNoteRequestHandler(notesService))
        .post(RequestsUrls.update, createUpdateNoteRequestHandler(notesService))
        .get(RequestsUrls.all, createAllNotesRequestHandler(notesService))
        .delete(RequestsUrls.delete, createDeleteNoteRequestHandler(notesService));

    return router;
}

const createAddNoteRequestHandler =
    (notesService: NotesService) =>
        async (req: Request, res: Response) => {
            const {title, description} = req.body;

            if (!title?.trim()) {
                res.status(400).json({message: ErrorMessages.noTitle});
                return;
            }

            if (!description?.trim()) {
                res.status(400).json({message: ErrorMessages.noDescription});
                return;
            }

            try {
                const note = await notesService.createNote(req.body);
                res.status(200).json({note: note})
            } catch (error) {
                handleError(error, res);
            }

            res.status(200).send();
        };

const createGetNoteRequestHandler =
    (notesService: NotesService) =>
        async (req: Request, res: Response) => {
            const {id} = req.body;

            if (!id.trim()) {
                res.status(400).json({message: ErrorMessages.noId});
            }

            try {
                const note = await notesService.getNote(id);
                res.status(200).json({note: note})
            } catch (error) {
                handleError(error, res);
            }
        };

const createUpdateNoteRequestHandler =
    (notesService: NotesService) =>
        async (req: Request, res: Response) => {
            const note = req.body;

            if (!note.id.trim()) {
                res.status(400).json({message: ErrorMessages.noId});
            }

            try {
                const updatedNote = await notesService.updateNote(note);
                res.status(200).json({note: updatedNote})
            } catch (error) {
                console.log(error);

                handleError(error, res);
            }
        };

const createAllNotesRequestHandler =
    (notesService: NotesService) =>
        async (req: Request, res: Response) => {
            try {
                const notes = await notesService.getNotes();
                res.status(200).json({notes: notes})
            } catch (error) {
                handleError(error, res);
            }
        };

const createDeleteNoteRequestHandler =
    (notesService: NotesService) =>
        async (req: Request, res: Response) => {
            const {id} = req.body;

            if (!id.trim()) {
                res.status(400).json({message: ErrorMessages.noId});
            }

            try {
                await notesService.deleteNote(id);
            } catch (error) {
                handleError(error, res);
            }

            res.status(200).send();
        };

const handleError = (error: Error | any, res: Response) => {
    logger.error(error);

    res.status(500).send();
}