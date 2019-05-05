import {NgModule} from '@angular/core';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {library} from '@fortawesome/fontawesome-svg-core';
import {faGithub, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import {faBalanceScale, faBars, faCog, faInfoCircle, faListAlt, faUserCircle} from "@fortawesome/free-solid-svg-icons";
import {faCopyright} from "@fortawesome/free-regular-svg-icons";

@NgModule({
    declarations: [],
    exports: [FontAwesomeModule],
    imports: [FontAwesomeModule]
})
export class IconsModule {
    constructor() {
        library.add(faGithub, faCopyright, faLinkedin, faBars, faBalanceScale, faListAlt, faCog, faInfoCircle, faUserCircle);
    }
}
