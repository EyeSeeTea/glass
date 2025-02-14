import { Maybe } from "../../../../types/utils";
import { ATCCodeLevel5, RouteOfAdministrationCode, SaltCode } from "../../GlassAtcVersionData";
import { Id } from "../../Ref";

export type RawSubstanceConsumptionData = {
    id: Id;
    atc_manual: ATCCodeLevel5;
    route_admin_manual: RouteOfAdministrationCode;
    salt_manual: SaltCode;
    packages_manual: number;
    ddds_manual: number;
    atc_version_manual: string;
    tons_manual: Maybe<number>;
    data_status_manual: Maybe<number>;
    health_sector_manual: string;
    health_level_manual: string;
    report_date: string;
};

export const RAW_SUBSTANCE_CONSUMPTION_DATA_KEYS = [
    "atc_manual",
    "route_admin_manual",
    "salt_manual",
    "packages_manual",
    "ddds_manual",
    "atc_version_manual",
    "tons_manual",
    "data_status_manual",
    "health_sector_manual",
    "health_level_manual",
];
