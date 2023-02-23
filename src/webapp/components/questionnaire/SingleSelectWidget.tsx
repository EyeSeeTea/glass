import React from "react";
// @ts-ignore
import { Radio } from "@dhis2/ui";
import { Id } from "../../../domain/entities/Base";
import { Maybe } from "../../../types/utils";
import { BaseWidgetProps } from "./BaseWidget";

export interface SingleSelectWidgetProps extends BaseWidgetProps<Option> {
    value: Maybe<Id>;
    options: Option[];
}

type Option = { id: string; name: string };

const SingleSelectWidget: React.FC<SingleSelectWidgetProps> = props => {
    const { onValueChange, value, options } = props;

    const notifyChange = React.useCallback(
        (selectedId: Id) => {
            const option = options.find(option => option.id === selectedId);
            const sameSelected = value === selectedId;
            onValueChange(sameSelected ? undefined : option);
        },
        [onValueChange, options, value]
    );

    return (
        <>
            {options.map(option => (
                <div onClick={props.disabled ? undefined : () => notifyChange(option.id)} key={option.id}>
                    <Radio
                        key={option.id}
                        checked={value === option.id}
                        label={option.name}
                        disabled={props.disabled}
                    />
                </div>
            ))}
        </>
    );
};

export default React.memo(SingleSelectWidget);
