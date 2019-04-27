import {Component} from '@angular/core';
import {faGithub, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import {faCopyright} from "@fortawesome/free-regular-svg-icons";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class AppFooterComponent {
    icons = {faLinkedin, faGithub, faCopyright};
}
