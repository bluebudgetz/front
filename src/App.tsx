import * as React from 'react';

import 'App.scss';
import {
    AppBar,
    CssBaseline,
    Divider,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemText,
    Toolbar,
    Typography
} from "@material-ui/core";
import {BrowserRouter as Router, Route, RouteComponentProps, withRouter} from "react-router-dom";
import {BubbleChartRounded, Copyright} from "@material-ui/icons";
import Overview from "Overview";
import About from "About";
import {GithubCircle, LinkedinBox} from "mdi-material-ui";

interface NavLinkProps extends RouteComponentProps {
    path: string
    primary: string
    secondary?: string
}

class NavLink extends React.Component<NavLinkProps> {
    public render() {
        return (
            <ListItem button={true} component="a" href={this.props.path} selected={this.props.path === this.props.location.pathname}>
                <ListItemText primary={this.props.primary} secondary={this.props.secondary}/>
            </ListItem>
        )
    }
}

class App extends React.Component {
    public render() {
        const RouteLink = withRouter(NavLink);
        return (
            <Router>
                <CssBaseline/>
                <div className="App">
                    <header>
                        <AppBar position="relative">
                            <Toolbar>
                                <IconButton style={{marginLeft: -12, marginRight: 20}} color="inherit">
                                    <BubbleChartRounded/>
                                </IconButton>
                                <Typography variant="h5" color="inherit" style={{flexGrow: 1}}>Bluebudgetz</Typography>
                            </Toolbar>
                        </AppBar>
                    </header>
                    <div className="Content">
                        <nav>
                            <List>
                                <RouteLink path="/" primary="Overview" secondary="Monetary overview"/>
                                <RouteLink path="/transactions" primary="Transactions" secondary="Search transactions"/>
                                <RouteLink path="/accounts" primary="Accounts" secondary="Manage accounts"/>
                                <RouteLink path="/settings" primary="Settings" secondary="Personal settings"/>
                                <Divider/>
                                <RouteLink path="/about" primary="About" secondary="About Bluebudgetz"/>
                                <Divider/>
                                <RouteLink path="https://material-ui.com" primary="Material UI" secondary=""/>
                                <RouteLink path="https://material.io/tools/icons" primary="Material UI Icons"/>
                            </List>
                        </nav>
                        <main>
                            <Route exact={true} path="/" component={Overview}/>
                            <Route path="/about" component={About}/>
                        </main>
                        <aside/>
                    </div>
                    <footer>
                        <Typography variant="subtitle2" align="center">Copyright</Typography>&nbsp;
                        <Copyright/>&nbsp;
                        <Typography variant="subtitle2" align="center"> Arik Kfir, 2019</Typography>&nbsp;
                        <Link href="https://www.linkedin.com/in/arikkfir/" target="_blank"><LinkedinBox/></Link>&nbsp;
                        <Link href="https://github.com/arikkfir" target="_blank"><GithubCircle/></Link>
                    </footer>
                </div>
            </Router>
        );
    }
}

export default App;
