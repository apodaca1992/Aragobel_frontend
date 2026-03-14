import { Component, OnInit } from "@angular/core";
import { ComponenteInterface } from "@interfaces/componente-interface";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {

  componentes: ComponenteInterface[] = [
    {
      icon: 'heart',
      name: 'prueba',
      redirectTo: '/home'
    },
    {
      icon: 'heart',
      name: 'prueba1',
      redirectTo: '/home'
    }
  ];
  loading:any;
  nombre:string = '';
  usuario = {
    email: '',
    password: ''
  };

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {
    //this.loadingService.show('Espere');
  }

  ngOnInit() {
    setTimeout(() => {
      //this.loadingService.dismiss();
      this.toastService.show("Prueba de toast");
    }, 1500);
  }

  onSubmitTemplate(){
    console.log(this.usuario)
  }


}
