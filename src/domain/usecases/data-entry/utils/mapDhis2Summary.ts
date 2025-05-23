import _ from "lodash";

import i18n from "../../../../locales";
import { DataValuesSaveSummary, ImportStrategy } from "../../../entities/data-entry/DataValuesSaveSummary";
import { ImportSummary } from "../../../entities/data-entry/ImportSummary";

export function mapDataValuesToImportSummary(
    dhis2Summary: DataValuesSaveSummary,
    action: ImportStrategy
): ImportSummary {
    const nonBlockingErrors =
        dhis2Summary.status === "WARNING"
            ? dhis2Summary.conflicts?.map(status => {
                  return {
                      error: status.value,
                      count: 1,
                  };
              }) || []
            : [];

    const blokingErrors =
        dhis2Summary.status === "ERROR"
            ? dhis2Summary.conflicts?.map(status => {
                  return {
                      error: status.value,
                      count: 1,
                  };
              }) || []
            : [];

    const ignoredErrors =
        action !== "DELETE" && dhis2Summary.importCount.ignored > 0 //If delete, ignore import ignored errors.
            ? dhis2Summary.conflicts && dhis2Summary.conflicts.length > 0
                ? dhis2Summary.conflicts?.map(status => {
                      return {
                          error: status.value,
                          count: 1,
                      };
                  })
                : [
                      {
                          error: i18n.t("Import Ignored"),
                          count: dhis2Summary.importCount.ignored,
                      },
                  ]
            : [];

    const finalBlockingErrors = _.compact([...blokingErrors, ...ignoredErrors]);

    const status = finalBlockingErrors.length > 0 ? "ERROR" : nonBlockingErrors.length > 0 ? "WARNING" : "SUCCESS";

    return {
        status,
        nonBlockingErrors,
        blockingErrors: finalBlockingErrors,
        importCount: {
            imported: dhis2Summary.importCount.imported,
            updated: dhis2Summary.importCount.updated,
            ignored: dhis2Summary.importCount.ignored,
            deleted: dhis2Summary.importCount.deleted,
            total:
                dhis2Summary.importCount.imported +
                dhis2Summary.importCount.updated +
                dhis2Summary.importCount.ignored +
                dhis2Summary.importCount.deleted,
        },
    };
}
