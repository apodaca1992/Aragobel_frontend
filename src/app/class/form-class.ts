import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup } from "@angular/forms";

export abstract class FormClass {
    markTouchedForm(form: FormGroup): void{
        form.markAllAsTouched();
    }

    setEmptyByControls(frm: FormGroup, arrStr: string[]):void{
        arrStr.forEach(x => {
          frm.get(x)?.patchValue('');
        });
    }

    getValueByControl(frm: FormGroup, key : string):string{
        return frm.get(key)?.value || '';
    }

    getFormatToISOString(dp: string):string{
        return new Date(dp).toISOString();
    }

    getFormat(date: string, simbol: string = '/'):string{
        let d : Date = new Date(date);
        return `${this.getFormatDayMonth(d.getDate().toString())}${simbol}${this.getFormatDayMonth((d.getMonth() + 1).toString())}${simbol}${d.getFullYear()}`;
    }

    getFormatInitYear(date: string, simbol: string = '/'):string{
        let d : Date = new Date(date);
        return `${this.getFormatDayMonth(d.getFullYear().toString())}${simbol}${this.getFormatDayMonth((d.getMonth() + 1).toString())}${simbol}${d.getDate()}`;
    }

    getDateAndTime(date: string):string{
        let d : Date = new Date(date);
        return `${this.getFormatDayMonth(d.getDate().toString())}/${this.getFormatDayMonth((d.getMonth() + 1).toString())}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    }
    
    getFormatDayMonth(dm:string):string{
        return parseInt(dm) < 10 ? `0${dm}` : dm;
    }

    getFormatCurrency(valueNumber : number): string{
        return `$${(valueNumber).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }
    
    inputValidation(frm: FormGroup, name : string) : Object{
        return {
          'is-invalid': (frm.controls[name].dirty || frm.controls[name].touched)  && frm.controls[name].invalid, 
          'is-valid': frm.controls[name].touched && frm.controls[name].valid
        }
    }
    
    showErrors(frm: FormGroup, name : string):boolean{
        return frm.controls[name].invalid && (frm.controls[name].dirty || frm.controls[name].touched);
    }
    
    messageError(err : HttpErrorResponse) : string{
        return err.error.mensaje !== null && err.error.mensaje !== '' && err.error.mensaje !== undefined ? err.error.mensaje.toString() : err.message.toString();
    }

    clearAllControlsValidators(frm: FormGroup):void{
        for(let ctrl in frm.controls){
            frm.get(ctrl)?.clearValidators();
            frm.get(ctrl)?.updateValueAndValidity();
        }

        frm.updateValueAndValidity();
    }

    enabledFormControls(enabled : boolean, frm: FormGroup, namesControls : string[]){
        for(let name of namesControls){
            enabled ? frm.get(name)?.enable({onlySelf: true}) : frm.get(name)?.disable({onlySelf: true});
        }

        frm.updateValueAndValidity();
    }
}
