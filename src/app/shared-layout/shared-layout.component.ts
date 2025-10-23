import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-shared-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './shared-layout.component.html',
  styleUrls: ['./shared-layout.component.scss']
})
export class SharedLayoutComponent {
  visitorCount = {
    total: 4894078,
    sinceJan25: 63590,
    today: 111
  };

  constructor(private router: Router) {}

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
showDownloadMenu = false;

toggleDownloadMenu() {
  this.showDownloadMenu = !this.showDownloadMenu;
}

  downloadFile(type: 'pdf' | 'pptx') {
  const urls = {
    pdf: 'https://cmms-api.ilizien-projects-cdf.in/media/ppt/CMMS_POC_ILIZIEN_final.pdf',
    pptx: 'https://cmms-api.ilizien-projects-cdf.in/media/ppt/CMMS_POC_ILIZIEN_final.pptx'
  };

  const names = {
    pdf: 'CMMS_ILIZIEN.pdf',
    pptx: 'CMMS_ILIZIEN.pptx'
  };

  fetch(urls[type])
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = names[type]; // force file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // cleanup
    });

  this.showDownloadMenu = false; // close popup after click
}
}
