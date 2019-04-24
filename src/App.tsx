import * as React from 'react';
import {ReactElement} from 'react';

import 'App.scss';
import {
    AppBar,
    CssBaseline,
    Divider,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from "@material-ui/core";
import {BrowserRouter as Router, Route, RouteComponentProps, withRouter} from "react-router-dom";
import {
    AllInboxRounded,
    BubbleChartRounded,
    Copyright,
    HomeRounded,
    InfoRounded,
    ListRounded,
    SettingsRounded
} from "@material-ui/icons";
import Overview from "Overview";
import About from "About";
import {GithubCircle, LinkedinBox} from "mdi-material-ui";

interface NavLinkProps extends RouteComponentProps {
    path: string
    primary: string
    secondary?: string
    icon: ReactElement
}

class NavLink extends React.Component<NavLinkProps> {
    public render() {
        const icon = this.props.icon;
        return (
            <ListItem button={true} component="a" href={this.props.path}
                      selected={this.props.path === this.props.location.pathname}>
                <ListItemIcon>{icon}</ListItemIcon>
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
                                <RouteLink icon={<HomeRounded/>} path="/" primary="Overview"
                                           secondary="Monetary overview"/>
                                <RouteLink icon={<ListRounded/>} path="/transactions" primary="Transactions"
                                           secondary="Search transactions"/>
                                <RouteLink icon={<AllInboxRounded/>} path="/accounts" primary="Accounts"
                                           secondary="Manage accounts"/>
                                <Divider/>
                                <RouteLink icon={<SettingsRounded/>} path="/settings" primary="Settings"
                                           secondary="Personal settings"/>
                                <Divider/>
                                <RouteLink icon={<InfoRounded/>} path="/about" primary="About"
                                           secondary="About Bluebudgetz"/>
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
