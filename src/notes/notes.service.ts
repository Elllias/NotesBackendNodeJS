import {Note, PrismaClient} from "@prisma/client";

export class NotesService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    createNote(note: Note): Promise<Note> {
        return this.prismaClient.note.create({
            data: note
        })
    }

    getNotes(): Promise<Note[]> {
        return this.prismaClient.note.findMany({});
    }

    getNote(id: string): Promise<Note | null> {
        return this.prismaClient.note.findFirst({
            where: {
                id
            }
        });
    }

    deleteNote(id: string): Promise<Note> {
        return this.prismaClient.note.delete({
            where: {
                id
            }
        });
    }

    updateNote(note: Note): Promise<Note> {
        return this.prismaClient.note.update({where: {id: note.id}, data: {title: note.title, description: note.description}})
    }
}