import * as React from "react";
import {Typography} from "@material-ui/core";
import MuiTreeView from "material-ui-treeview";

class Accounts extends React.Component {
    public render() {
        const tree = [
            {
                value: 'Parent A',
                nodes: [{ value: 'Child A' }, { value: 'Child B' }],
            },
            {
                value: 'Parent B',
                nodes: [
                    {
                        value: 'Child C',
                    },
                    {
                        value: 'Parent C',
                        nodes: [
                            { value: 'Child D' },
                            { value: 'Child E' },
                            { value: 'Child F' },
                        ],
                    },
                ],
            },
        ];
        return (
            <div>
                <Typography variant="h3" gutterBottom={true}>Accounts</Typography>
                <MuiTreeView tree={tree}/>
            </div>
        );
    }
}

export default Accounts;
