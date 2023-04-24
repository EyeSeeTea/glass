import { FutureData } from "../entities/Future";
import { Ref } from "../entities/Ref";

export interface UsersRepository {
    getAllFilteredbyOUsAndUserGroups(orgUnits: string[], userGroups: string[]): FutureData<Ref[]>;
}
