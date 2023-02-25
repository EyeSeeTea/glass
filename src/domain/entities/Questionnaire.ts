import { assertUnreachable, Maybe } from "../../types/utils";
import { Id, NamedRef, Ref } from "./Base";

export interface QuestionnaireSimple {
    id: Id;
    name: string;
    description: string;
    orgUnit: Ref;
    year: number;
    isCompleted: boolean;
    isMandatory: boolean;
}

export interface QuestionnaireSelector {
    id: Id;
    orgUnitId: Id;
    year: number;
}

export interface Questionnaire extends QuestionnaireSimple {
    sections: QuestionnaireSection[];
}

export interface QuestionnaireSection {
    title: string;
    questions: QuestionnaireQuestion[];
}

export type QuestionnaireQuestion = SelectQuestion | NumberQuestion | TextQuestion | BooleanQuestion;

export interface QuestionBase {
    id: Id;
    text: string;
}

export interface SelectQuestion extends QuestionBase {
    type: "select";
    options: QuestionOption[];
    value: Maybe<QuestionOption>;
}

export interface NumberQuestion extends QuestionBase {
    type: "number";
    numberType:
        | "NUMBER"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "INTEGER"
        | "INTEGER_NEGATIVE"
        | "INTEGER_POSITIVE"
        | "INTEGER_ZERO_OR_POSITIVE";
    value: string; // Use string representation to avoid problems with rounding
}

export interface TextQuestion extends QuestionBase {
    type: "text";
    value: string;
    multiline: boolean;
}

export interface BooleanQuestion extends QuestionBase {
    type: "boolean";
    value: Maybe<boolean>;
}

export type QuestionOption = NamedRef;

export class QuestionnarieM {
    static setAsComplete(questionnarie: Questionnaire, value: boolean): Questionnaire {
        return { ...questionnarie, isCompleted: value };
    }

    static updateQuestion(questionnaire: Questionnaire, questionUpdated: QuestionnaireQuestion): Questionnaire {
        return {
            ...questionnaire,
            sections: questionnaire.sections.map(section => ({
                ...section,
                questions: section.questions.map(question =>
                    question.id === questionUpdated.id ? questionUpdated : question
                ),
            })),
        };
    }
}

export class QuestionnaireQuestionM {
    static isValidNumberValue(s: string, numberType: NumberQuestion["numberType"]): boolean {
        switch (numberType) {
            case "INTEGER":
                return isInteger(s);
            case "NUMBER":
                return true;
            case "INTEGER_ZERO_OR_POSITIVE":
                return isInteger(s) && parseInt(s) >= 0;
            case "INTEGER_NEGATIVE":
                return isInteger(s) && parseInt(s) < 0;
            case "INTEGER_POSITIVE":
                return isInteger(s) && parseInt(s) > 0;
            default:
                assertUnreachable(numberType);
        }
    }

    static update<Q extends QuestionnaireQuestion>(question: Q, value: Q["value"]): Q {
        return { ...question, value };
    }
}

function isInteger(s: string): boolean {
    return Boolean(s.match(/^-?\d*$/));
}
