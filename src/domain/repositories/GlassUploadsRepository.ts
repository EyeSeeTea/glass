import { FutureData } from "../entities/Future";
import { GlassUploads } from "../entities/GlassUploads";

export interface GlassUploadsRepository {
    getAll(): FutureData<GlassUploads[]>;
    save(upload: GlassUploads): FutureData<void>;
}
