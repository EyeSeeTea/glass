import React from "react";
import styled from "styled-components";
import { glassColors } from "../../pages/app/themes/dhis2.theme";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { CompleteButtons } from "./CompleteButtons";

export const Completed: React.FC = () => {
    return (
        <ContentWrapper>
            <p className="intro">{i18n.t("Thank! your data for now is uploaded in our system")}</p>
            <div className="call-name">
                <span>2020</span>
                <span>Spain</span>
            </div>
            <Section className="summary">
                <p>Any other userful information here?</p>
            </Section>
            <Section className="summary">
                <p>Info abou the previously updated quarter and the missing quarters</p>
            </Section>
            <CompleteButtons />
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;

    .bottom {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin: 0 auto 30px auto;
        align-items: flex-end;
        width: 100%;
    }
    .call-name {
        display: flex;
        gap: 40px;
        align-items: center;
        justify-content: center;
        font-weight: 500;
    }
`;

const Section = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    text-align: center;
    margin: 0px auto;
    border: 1px solid ${glassColors.grey};
    p {
        margin: 40px;
    }
`;
