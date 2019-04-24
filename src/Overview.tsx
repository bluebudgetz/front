import * as React from "react";
import {Typography} from "@material-ui/core";

class Overview extends React.Component {
    public render() {
        return (
            <div>
                <Typography variant="h3" gutterBottom={true}>Home</Typography>

                <Typography variant="headline" gutterBottom={true}>
                    Welcome to Bluebudgetz, your one stop shop to home accounting, done right!
                </Typography>

                <Typography variant="body1">
                    Bluebudgetz aims to take away the tedious parts of your accounting work, automatically parsing your
                    bank & credit card transactions, giving you an overview that's always accurate - and to help you
                    get <b>actionable insights</b>.
                </Typography>
            </div>
        );
    }
}

export default Overview;
