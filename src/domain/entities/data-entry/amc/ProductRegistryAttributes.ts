import { Maybe } from "../../../../types/utils";
import { UnitCode, RouteOfAdministrationCode, SaltCode } from "../../GlassAtcVersionData";

export type ProductRegistryAttributes = {
    AMR_GLASS_AMC_TEA_PRODUCT_ID: string;
    AMR_GLASS_AMC_TEA_PACKSIZE: number;
    AMR_GLASS_AMC_TEA_STRENGTH: number;
    AMR_GLASS_AMC_TEA_STRENGTH_UNIT: UnitCode;
    AMR_GLASS_AMC_TEA_CONC_VOLUME: Maybe<number>;
    AMR_GLASS_AMC_TEA_ATC: string;
    AMR_GLASS_AMC_TEA_COMBINATION: Maybe<string>;
    AMR_GLASS_AMC_TEA_ROUTE_ADMIN: RouteOfAdministrationCode;
    AMR_GLASS_AMC_TEA_SALT: SaltCode;
    AMR_GLASS_AMC_TEA_VOLUME: Maybe<number>;
};

export const PRODUCT_REGISTRY_ATTRIBUTES_KEYS = [
    "AMR_GLASS_AMC_TEA_PRODUCT_ID",
    "AMR_GLASS_AMC_TEA_PACKSIZE",
    "AMR_GLASS_AMC_TEA_STRENGTH",
    "AMR_GLASS_AMC_TEA_STRENGTH_UNIT",
    "AMR_GLASS_AMC_TEA_CONC_VOLUME",
    "AMR_GLASS_AMC_TEA_ATC",
    "AMR_GLASS_AMC_TEA_COMBINATION",
    "AMR_GLASS_AMC_TEA_ROUTE_ADMIN",
    "AMR_GLASS_AMC_TEA_SALT",
    "AMR_GLASS_AMC_TEA_VOLUME",
];
