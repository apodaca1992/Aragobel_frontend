import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent  implements OnInit {
  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    //this.toastService.show('¡Guardado correctamente!', 'success', 'checkmark-circle-outline');
  }


}
