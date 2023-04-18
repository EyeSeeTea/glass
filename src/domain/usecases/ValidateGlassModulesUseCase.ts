import { UseCase } from "../../CompositionRoot";
import { glassColors } from "../../webapp/pages/app/themes/dhis2.theme";
import { Future, FutureData } from "../entities/Future";
import { GlassModule } from "../entities/GlassModule";
import { GlassModuleRepository } from "../repositories/GlassModuleRepository";

export class ValidateGlassModulesUseCase implements UseCase {
    constructor(private glassModuleRepository: GlassModuleRepository) {}

    public execute(): FutureData<void> {
        return this.glassModuleRepository
            .getAll()
            .flatMap(data =>
                data.length === 0 ? this.glassModuleRepository.save(glassModules) : Future.success(undefined)
            );
    }
}

const glassModules: GlassModule[] = [
    {
        id: "AVnpk4xiXGG",
        name: "AMR",
        color: glassColors.lightSecondary,
        userGroups: {
            readAccess: [],
            captureAccess: [],
        },
        questionnaires: [],
        consistencyChecks: {
            specimenPathogen: {
                BLOOD: ["ACISPP", "ESCCOL", "KLEPNE", "PSEAER", "STAAUR", "STRPNE", "SALSPP", "SALTYP", "SALPAR"],
                CSF: ["STRPNE", "NEIGON", "HAEINF"],
                URINE: ["ESCCOL", "KLEPNE"],
                STOOL: ["SALSPP", "SHISPP"],
                LOWRESP: ["STRPNE", "HAEINF", "STAAUR", "ACISPP", "ESCCOL", "KLEPNE", "PSEAER"],
                UROGENITAL: ["NEIGON"],
                ANORECTAL: ["NEIGON"],
                PHARYNGEAL: ["NEIGON"],
            },
            pathogenAntibiotic: {
                ACISPP: ["J01AA", "J01GB", "J01DH", "J01XB", "TGC", "GEN", "IPM", "COL", "MNO", "AMK", "MEM", "DOR"],
                ESCCOL: [
                    "J01EE",
                    "J01MA",
                    "J01DD",
                    "J01DE",
                    "J01DH",
                    "J01XB",
                    "SXT",
                    "CIP",
                    "CRO",
                    "FEP",
                    "IPM",
                    "COL",
                    "LVX",
                    "CTX",
                    "MEM",
                    "CAZ",
                    "ETP",
                    "DOR",
                    "J01XE",
                    "J01CA",
                    "CEF",
                ],
                KLEPNE: [
                    "J01EE",
                    "J01MA",
                    "J01DD",
                    "J01DE",
                    "J01DH",
                    "J01XB",
                    "SXT",
                    "CIP",
                    "CRO",
                    "FEP",
                    "IPM",
                    "COL",
                    "LVX",
                    "CTX",
                    "MEM",
                    "CAZ",
                    "ETP",
                    "DOR",
                    "J01XE",
                    "J01CA",
                    "CEF",
                ],
                PSEAER: [
                    "J01DD",
                    "J01CR",
                    "J01GB",
                    "J01DH",
                    "J01XB",
                    "CAZ",
                    "TZP",
                    "GEN",
                    "IPM",
                    "COL",
                    "AMK",
                    "MEM",
                    "TOB",
                    "DOR",
                ],
                STAAUR: ["J01CF", "J01CE", "OXA", "FOX"],
                STRPNE: [
                    "J01CF",
                    "J01CE",
                    "J01DD",
                    "J01EE",
                    "J01FA",
                    "PEN",
                    "OXA",
                    "CRO",
                    "SXT",
                    "ERY",
                    "CTX",
                    "J01CE",
                    "CFM",
                ],
                SALSPP: ["J01MA", "J01DD", "J01DH", "CIP", "CRO", "LVX", "CTX", "CAZ", "J01EE", "SXT"],
                SALTYP: [
                    "J01BA",
                    "J01CA",
                    "J01EE",
                    "J01MA",
                    "J01DD",
                    "J01FA",
                    "CHL",
                    "AMP",
                    "SXT",
                    "CIP",
                    "CRO",
                    "AZM",
                    "LVX",
                    "CTX",
                    "CAZ",
                ],
                SALPAR: [
                    "J01BA",
                    "J01CA",
                    "J01EE",
                    "J01MA",
                    "J01DD",
                    "J01FA",
                    "CHL",
                    "AMP",
                    "SXT",
                    "CIP",
                    "CRO",
                    "AZM",
                    "LVX",
                    "CTX",
                    "CAZ",
                ],
                NEIMEN: ["J01CE", "J01MA", "J01DD", "OXA", "RIF", "CIP", "CRO", "CTX"],
                HAEINF: ["J01CA", "J01CR", "J01DD", "J01EE", "AMP", "AMC", "CRO", "SXT", "CTX", "J01MA", "CIP", "LVX"],
                SHISPP: ["J01EE", "J01MA", "J01DD", "J01FA", "SXT", "CIP", "CRO", "AZM", "LVX", "CTX", "CAZ"],
                NEIGON: ["J01DD", "J01FA", "J01MA", "CRO", "AZM", "SPT", "CIP", "CFM"],
            },
        },
        dashboards: {
            reportsMenu: "",
            validationReport: "",
        },
    },
    {
        id: "BVnik5xiXGJ",
        name: "AMC",
        color: glassColors.lightTertiary,
        userGroups: {
            readAccess: [],
            captureAccess: [],
        },
        questionnaires: [],
        dashboards: {
            reportsMenu: "",
            validationReport: "",
        },
    },
    {
        id: "CVVp44xiXGJ",
        name: "EGASP",
        color: glassColors.lightPrimary,
        userGroups: {
            readAccess: [],
            captureAccess: [],
        },
        questionnaires: [],
        dashboards: {
            reportsMenu: "",
            validationReport: "",
        },
    },
];
