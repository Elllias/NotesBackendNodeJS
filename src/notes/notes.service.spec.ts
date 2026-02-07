import { NotesService } from "./notes.service";
import { PrismaClient, Note } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>())
}));

describe("NotesService", () => {
    let notesService: NotesService;
    let prismaMock: DeepMockProxy<PrismaClient>;

    beforeEach(() => {
        prismaMock = mockDeep<PrismaClient>();
        notesService = new NotesService(prismaMock);
    });

    afterEach(() => {
        mockReset(prismaMock);
        jest.clearAllMocks();
    });

    describe("createNote", () => {
        it("should create a note successfully", async () => {
            const mockNote: Note = {
                id: "1",
                title: "Test Note",
                description: "Test Description",
                createdAt: new Date()
            };

            prismaMock.note.create.mockResolvedValue(mockNote);

            const result = await notesService.createNote(mockNote);

            expect(prismaMock.note.create).toHaveBeenCalledWith({
                data: mockNote
            });
            expect(result).toEqual(mockNote);
        });

        it("should handle database errors when creating note", async () => {
            const mockNote: Note = {
                id: "1",
                title: "Test Note",
                description: "Test Description",
                createdAt: new Date()
            };

            const error = new Error("Database connection failed");
            prismaMock.note.create.mockRejectedValue(error);

            await expect(notesService.createNote(mockNote))
                .rejects
                .toThrow("Database connection failed");

            expect(prismaMock.note.create).toHaveBeenCalledWith({
                data: mockNote
            });
        });
    });

    describe("getNotes", () => {
        it("should return all notes", async () => {
            const mockNotes: Note[] = [
                {
                    id: "1",
                    title: "Note 1",
                    description: "Description 1",
                    createdAt: new Date("2024-01-01")
                },
                {
                    id: "2",
                    title: "Note 2",
                    description: "Description 2",
                    createdAt: new Date("2024-01-02")
                }
            ];

            prismaMock.note.findMany.mockResolvedValue(mockNotes);

            const result = await notesService.getNotes();

            expect(prismaMock.note.findMany).toHaveBeenCalledWith({});
            expect(result).toEqual(mockNotes);
            expect(result).toHaveLength(2);
        });

        it("should return empty array when no notes exist", async () => {
            prismaMock.note.findMany.mockResolvedValue([]);

            const result = await notesService.getNotes();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should handle errors when fetching notes", async () => {
            const error = new Error("Query failed");
            prismaMock.note.findMany.mockRejectedValue(error);

            await expect(notesService.getNotes())
                .rejects
                .toThrow("Query failed");
        });
    });

    describe("getNote", () => {
        it("should return a note by id", async () => {
            const noteId = "123";
            const mockNote: Note = {
                id: noteId,
                title: "Test Note",
                description: "Test Description",
                createdAt: new Date()
            };

            prismaMock.note.findFirst.mockResolvedValue(mockNote);

            const result = await notesService.getNote(noteId);

            expect(prismaMock.note.findFirst).toHaveBeenCalledWith({
                where: { id: noteId }
            });
            expect(result).toEqual(mockNote);
        });

        it("should return null when note not found", async () => {
            const noteId = "non-existent-id";
            prismaMock.note.findFirst.mockResolvedValue(null);

            const result = await notesService.getNote(noteId);

            expect(result).toBeNull();
            expect(prismaMock.note.findFirst).toHaveBeenCalledWith({
                where: { id: noteId }
            });
        });

        it("should handle errors when fetching a note", async () => {
            const noteId = "123";
            const error = new Error("Find operation failed");
            prismaMock.note.findFirst.mockRejectedValue(error);

            await expect(notesService.getNote(noteId))
                .rejects
                .toThrow("Find operation failed");
        });

        it("should handle empty id string", async () => {
            const noteId = "";
            prismaMock.note.findFirst.mockResolvedValue(null);

            const result = await notesService.getNote(noteId);

            expect(result).toBeNull();
            expect(prismaMock.note.findFirst).toHaveBeenCalledWith({
                where: { id: "" }
            });
        });
    });

    describe("deleteNote", () => {
        it("should delete a note successfully", async () => {
            const noteId = "123";
            const mockNote: Note = {
                id: noteId,
                title: "Note to delete",
                description: "Description",
                createdAt: new Date()
            };

            prismaMock.note.delete.mockResolvedValue(mockNote);

            const result = await notesService.deleteNote(noteId);

            expect(prismaMock.note.delete).toHaveBeenCalledWith({
                where: { id: noteId }
            });
            expect(result).toEqual(mockNote);
        });

        it("should throw error when trying to delete non-existent note", async () => {
            const noteId = "non-existent-id";
            const error = new Error("Record to delete does not exist");
            prismaMock.note.delete.mockRejectedValue(error);

            await expect(notesService.deleteNote(noteId))
                .rejects
                .toThrow("Record to delete does not exist");

            expect(prismaMock.note.delete).toHaveBeenCalledWith({
                where: { id: noteId }
            });
        });

        it("should handle database errors during deletion", async () => {
            const noteId = "123";
            const error = new Error("Database constraint violation");
            prismaMock.note.delete.mockRejectedValue(error);

            await expect(notesService.deleteNote(noteId))
                .rejects
                .toThrow("Database constraint violation");
        });
    });

    describe("updateNote", () => {
        it("should update a note successfully", async () => {
            const mockNote: Note = {
                id: "123",
                title: "Updated Title",
                description: "Updated Description",
                createdAt: new Date("2024-01-01")
            };

            prismaMock.note.update.mockResolvedValue(mockNote);

            const result = await notesService.updateNote(mockNote);

            expect(prismaMock.note.update).toHaveBeenCalledWith({
                where: { id: mockNote.id },
                data: {
                    title: mockNote.title,
                    description: mockNote.description
                }
            });
            expect(result).toEqual(mockNote);
        });

        it("should update only title and description fields", async () => {
            const mockNote: Note = {
                id: "123",
                title: "Only Title Updated",
                description: "Only Description Updated",
                createdAt: new Date("2024-01-01")
            };

            prismaMock.note.update.mockResolvedValue(mockNote);

            await notesService.updateNote(mockNote);

            expect(prismaMock.note.update).toHaveBeenCalledWith({
                where: { id: mockNote.id },
                data: {
                    title: mockNote.title,
                    description: mockNote.description
                }
            });

            const callArgs = prismaMock.note.update.mock.calls[0][0];
            expect(callArgs.data).not.toHaveProperty('createdAt');
            expect(callArgs.data).not.toHaveProperty('updatedAt');
        });

        it("should throw error when trying to update non-existent note", async () => {
            const mockNote: Note = {
                id: "non-existent-id",
                title: "Title",
                description: "Description",
                createdAt: new Date()
            };

            const error = new Error("Record to update not found");
            prismaMock.note.update.mockRejectedValue(error);

            await expect(notesService.updateNote(mockNote))
                .rejects
                .toThrow("Record to update not found");
        });

        it("should handle partial update data", async () => {
            const mockNote: Note = {
                id: "123",
                title: "Only Title",
                description: "",
                createdAt: new Date()
            };

            prismaMock.note.update.mockResolvedValue(mockNote);

            await notesService.updateNote(mockNote);

            expect(prismaMock.note.update).toHaveBeenCalledWith({
                where: { id: mockNote.id },
                data: {
                    title: "Only Title",
                    description: ""
                }
            });
        });
    });

    describe("edge cases", () => {
        it("should handle concurrent operations", async () => {
            const mockNote1: Note = {
                id: "1",
                title: "Note 1",
                description: "Desc 1",
                createdAt: new Date()
            };

            const mockNote2: Note = {
                id: "2",
                title: "Note 2",
                description: "Desc 2",
                createdAt: new Date()
            };

            prismaMock.note.findMany
                .mockResolvedValueOnce([mockNote1])
                .mockResolvedValueOnce([mockNote1, mockNote2]);

            const result1 = await notesService.getNotes();
            expect(result1).toEqual([mockNote1]);

            const result2 = await notesService.getNotes();
            expect(result2).toEqual([mockNote1, mockNote2]);
        });

        it("should handle very long strings", async () => {
            const longString = "A".repeat(1000);
            const mockNote: Note = {
                id: "1",
                title: longString,
                description: longString,
                createdAt: new Date()
            };

            prismaMock.note.create.mockResolvedValue(mockNote);

            const result = await notesService.createNote(mockNote);

            expect(result.title).toHaveLength(1000);
            expect(result.description).toHaveLength(1000);
        });

        it("should handle special characters in note content", async () => {
            const mockNote: Note = {
                id: "1",
                title: "Note with special chars: !@#$%^&*()",
                description: "Description with emoji 😀 and newline\n",
                createdAt: new Date()
            };

            prismaMock.note.create.mockResolvedValue(mockNote);

            const result = await notesService.createNote(mockNote);

            expect(result.title).toContain("!@#$%^&*()");
            expect(result.description).toContain("😀");
        });
    });

    describe("service initialization", () => {
        it("should accept valid prisma client instance", () => {
            expect(notesService).toBeInstanceOf(NotesService);
            expect(() => new NotesService(prismaMock)).not.toThrow();
        });
    });
});