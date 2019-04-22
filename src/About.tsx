import * as React from "react";
import {Typography} from "@material-ui/core";

class About extends React.Component {
    public render() {
        return (
            <div>
                <Typography variant="h3" gutterBottom={true}>About</Typography>

                <Typography variant="body1">
                    Blue Budgetz is a software-as-a-service (SaaS) meant to help you better spend & save your money.
                </Typography>
            </div>
        );
    }
}

export default About;
