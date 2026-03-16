import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {
  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    //this.toastService.show('¡Guardado correctamente!', 'success', 'checkmark-circle-outline');
  }


}
