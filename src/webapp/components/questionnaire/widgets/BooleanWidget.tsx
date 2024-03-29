import React from "react";
// @ts-ignore
import { Checkbox } from "@dhis2/ui";
import { Maybe } from "../../../../types/utils";
import { BaseWidgetProps } from "./BaseWidget";
import i18n from "@eyeseetea/d2-ui-components/locales";

export interface BooleanWidgetProps extends BaseWidgetProps<boolean> {
    value: Maybe<boolean>;
    infoText?: string;
}

const BooleanWidget: React.FC<BooleanWidgetProps> = props => {
    const { onChange: onValueChange, value, disabled, infoText } = props;

    const [stateValue, setStateValue] = React.useState(value);
    React.useEffect(() => setStateValue(value), [value]);

    const notifyChange = React.useCallback(
        ({ checked: newValue }: { checked: boolean }) => {
            setStateValue(newValue);
            onValueChange(newValue);
        },
        [onValueChange]
    );

    return (
        <>
            <Checkbox label={i18n.t("Yes")} checked={stateValue === true} disabled={disabled} onChange={notifyChange} />
            {infoText && <p>${infoText}</p>}
        </>
    );
};

export default React.memo(BooleanWidget);
