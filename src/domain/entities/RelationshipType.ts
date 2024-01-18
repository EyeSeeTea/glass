import { Id, Ref } from "@eyeseetea/d2-api";
import { NamedRef } from "./Ref";

export interface RelationshipType {
    id: Id;
    name: string;
    constraints: {
        from: RelationshipConstraint;
        to: RelationshipConstraint;
    };
}

export type RelationshipConstraint = RelationshipConstraintTei | RelationshipConstraintEventInProgram;

export interface RelationshipConstraintTei {
    type: "tei";
    name: string;
    program?: Ref;
    teis: Ref[]; // Selectable TEIs for this constraint
}

export interface RelationshipConstraintEventInProgram {
    type: "eventInProgram";
    program: NamedRef;
    programStage?: NamedRef;
    events: Ref[];
}
