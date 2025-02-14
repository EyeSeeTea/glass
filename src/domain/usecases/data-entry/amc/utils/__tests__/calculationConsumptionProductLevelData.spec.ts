import productRegistryAttributesBasic from "./data/productRegistryAttributesBasic.json";
import productRegistryAttributesWrongStrengthUnit from "./data/productRegistryAttributesWrongStrengthUnit.json";
import productRegistryAttributesConcVolumeAndVolume from "./data/productRegistryAttributesConcVolumeAndVolume.json";
import productRegistryAttributesUnitDoseCombCode from "./data/productRegistryAttributesUnitDoseCombCode.json";
import productRegistryAttributesMillionInternationalUnitDifferentDDDUnit from "./data/productRegistryAttributesMillionInternationalUnitDifferentDDDUnit.json";
import productRegistryAttributesNoCombCodeNoFoundDDD from "./data/productRegistryAttributesNoCombCodeNoFoundDDD.json";
import calculationSolutionBasic from "./data/calculationSolutionBasic.json";
import calculationSolutionConcVolumeAndVolume from "./data/calculationSolutionConcVolumeAndVolume.json";
import calculationSolutionUnitDoseCombCode from "./data/calculationSolutionUnitDoseCombCode.json";
import calculationMillionInternationalUnitDifferentDDDUnit from "./data/calculationMillionInternationalUnitDifferentDDDUnit.json";
import atcCurrentVersionDataJson from "./data/atcCurrentVersionData.json";
import rawProductConsumptionJson from "./data/rawProductConsumption.json";
import { calculateConsumptionProductLevelData } from "../calculationConsumptionProductLevelData";
import { GlassAtcVersionData } from "../../../../../entities/GlassAtcVersionData";
import { ProductRegistryAttributes } from "../../../../../entities/data-entry/amc/ProductRegistryAttributes";
import { RawProductConsumption } from "../../../../../entities/data-entry/amc/RawProductConsumption";
import { RawSubstanceConsumptionCalculated } from "../../../../../entities/data-entry/amc/RawSubstanceConsumptionCalculated";
import { setupLoggerForTesting } from "../../../../../../utils/logger";

describe("Given calculate Consumption Product Level Data function", () => {
    beforeAll(async () => await setupLoggerForTesting());

    describe("When product registry attributes has: strength unit from gram family (then content from gram family), no concentration volume and no volume, no combination codes, strength unit and ddd unit are the same", () => {
        it("Then should return correct solution", async () => {
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType();
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionData = givenAtcCurrentVersionData();
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionData,
                atcVersionKey
            );
            verifyCalculationResult(rawSubstanceConsumptionCalculatedData);
        });
    });
    describe("When product registry attributes has: strength unit from gram family (then content from gram family), has concentration volume and volume, no combination codes, strength unit and ddd unit are the same", () => {
        it("Then should return correct solution", async () => {
            const type = "conc_volume_and_volume";
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType(type);
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionData = givenAtcCurrentVersionData();
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionData,
                atcVersionKey
            );

            verifyCalculationResult(rawSubstanceConsumptionCalculatedData, type);
        });
    });
    describe("When product registry attributes has: strength unit from unit dose family (then content from unit dose family), no concentration volume and no volume, has combination codes, strength unit and ddd unit are the same", () => {
        it("Then should return correct solution", async () => {
            const type = "unit_dose_combination_code";
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType(type);
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionData = givenAtcCurrentVersionData();
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionData,
                atcVersionKey
            );

            verifyCalculationResult(rawSubstanceConsumptionCalculatedData, type);
        });
    });
    describe("When product registry attributes has: strength unit from millions international unit family (then content from millions international unit family), no concentration volume and no volume, no combination codes, strength unit and ddd unit are different", () => {
        it("Then should return correct solution", async () => {
            const type = "millions_international_unit_different_ddd_unit";
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType(type);
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionData = givenAtcCurrentVersionData();
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionData,
                atcVersionKey
            );

            verifyCalculationResult(rawSubstanceConsumptionCalculatedData, type);
        });
    });
    describe("When product registry attributes has no combination code and there is no found DDD in the atcCurrentVersionData for the corresponding ATC, Route of Administration and Salt", () => {
        it("Then should return correct solution and no DDD will be calculated", async () => {
            const type = "no_combination_code_no_found_ddd";
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType(type);
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionData = givenAtcCurrentVersionData();
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionData,
                atcVersionKey
            );

            verifyCalculationResult(rawSubstanceConsumptionCalculatedData, type);
        });
    });
    describe("When product registry attributes has strength unit NOT from gram family", () => {
        it("Then should return correct solution and don't do calculations for that row", async () => {
            const type = "wrong_strength_unit";
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType(type);
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionData = givenAtcCurrentVersionData();
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionData,
                atcVersionKey
            );

            verifyCalculationResult(rawSubstanceConsumptionCalculatedData, type);
        });
    });
    describe("When we do not have atc data", () => {
        it("Then should return correct solution and don't do calculations", async () => {
            const type = "no_atc_data";
            const period = "2020";
            const orgUnitId = "vboedbUs1As";
            const productRegistryAttributes = givenProductRegistryAttributesByType(type);
            const rawProductConsumption = givenRawProductConsumption();
            const atcCurrentVersionDataEmpty = {} as unknown as GlassAtcVersionData;
            const atcVersionKey = "ATC-2023-v1";

            const rawSubstanceConsumptionCalculatedData = calculateConsumptionProductLevelData(
                period,
                orgUnitId,
                productRegistryAttributes,
                rawProductConsumption,
                atcCurrentVersionDataEmpty,
                atcVersionKey
            );

            verifyCalculationResult(rawSubstanceConsumptionCalculatedData, type);
        });
    });
});

function givenProductRegistryAttributesByType(type?: string): ProductRegistryAttributes[] {
    const productRegistryAttributesTypes: Record<string, ProductRegistryAttributes[]> = {
        basic: productRegistryAttributesBasic,
        no_atc_data: productRegistryAttributesBasic,
        conc_volume_and_volume: productRegistryAttributesConcVolumeAndVolume,
        unit_dose_combination_code: productRegistryAttributesUnitDoseCombCode,
        millions_international_unit_different_ddd_unit:
            productRegistryAttributesMillionInternationalUnitDifferentDDDUnit,
        no_combination_code_no_found_ddd: productRegistryAttributesNoCombCodeNoFoundDDD,
        wrong_strength_unit: productRegistryAttributesWrongStrengthUnit,
    };

    const productRegistryAttributes = type
        ? productRegistryAttributesTypes[type]
        : productRegistryAttributesTypes.basic;

    return productRegistryAttributes as ProductRegistryAttributes[];
}

function givenRawProductConsumption(): RawProductConsumption[] {
    return rawProductConsumptionJson as RawProductConsumption[];
}

function givenAtcCurrentVersionData(): GlassAtcVersionData {
    return atcCurrentVersionDataJson as GlassAtcVersionData;
}

function getExpectedCalculationSolution(type?: string): RawSubstanceConsumptionCalculated[] {
    const calculationSolutionTypes = {
        basic: calculationSolutionBasic,
        conc_volume_and_volume: calculationSolutionConcVolumeAndVolume,
        unit_dose_combination_code: calculationSolutionUnitDoseCombCode,
        millions_international_unit_different_ddd_unit: calculationMillionInternationalUnitDifferentDDDUnit,
        no_combination_code_no_found_ddd: [],
        wrong_strength_unit: [],
        no_atc_data: [],
    } as Record<string, RawSubstanceConsumptionCalculated[]>;

    const calculationSolution = type ? calculationSolutionTypes[type] : calculationSolutionTypes.basic;

    return calculationSolution as RawSubstanceConsumptionCalculated[];
}

function verifyCalculationResult(result: RawSubstanceConsumptionCalculated[], type?: string) {
    const expectedSolution: RawSubstanceConsumptionCalculated[] = getExpectedCalculationSolution(type);

    expect(result?.length).toBe(expectedSolution?.length);

    result.forEach((calculation, index) => {
        const expectedCalculation = expectedSolution[index];
        expect(calculation.AMR_GLASS_AMC_TEA_PRODUCT_ID).toBe(expectedCalculation?.AMR_GLASS_AMC_TEA_PRODUCT_ID);
        expect(calculation.atc_autocalculated).toBe(expectedCalculation?.atc_autocalculated);
        expect(calculation.route_admin_autocalculated).toBe(expectedCalculation?.route_admin_autocalculated);
        expect(calculation.salt_autocalculated).toBe(expectedCalculation?.salt_autocalculated);
        expect(calculation.year).toBe(expectedCalculation?.year);
        expect(calculation.packages_autocalculated).toBe(expectedCalculation?.packages_autocalculated);
        expect(calculation.kilograms_autocalculated).toBe(expectedCalculation?.kilograms_autocalculated);
        expect(calculation.ddds_autocalculated).toBe(expectedCalculation?.ddds_autocalculated);
        expect(calculation.data_status_autocalculated).toBe(expectedCalculation?.data_status_autocalculated);
        expect(calculation.health_sector_autocalculated).toBe(expectedCalculation?.health_sector_autocalculated);
        expect(calculation.atc_version_autocalculated).toBe(expectedCalculation?.atc_version_autocalculated);
        expect(calculation.health_level_autocalculated).toBe(expectedCalculation?.health_level_autocalculated);
    });
}
