import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AppService} from "./app.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('popupSuccess') popupSuccess!: TemplateRef<ElementRef>;
  successDialogRef: MatDialogRef<any> | null = null;


  currency: string = '$';

  form = this.fb.group({
    order: ["", Validators.required],
    name: ["", Validators.required],
    phone: ["", Validators.required],
  });

  productsData: any;

  constructor(
    private fb: FormBuilder, private appService: AppService, private dialog: MatDialog, private router: Router) {
  }

  ngOnInit() {
    this.appService.getData()
      .subscribe(data => this.productsData = data);
  }



  scrollTo(target: HTMLElement, burger?: any) {
    target.scrollIntoView({behavior: "smooth"});
    if (burger) {
      this.form.patchValue({order: burger.title + ' (' + burger.price + ' ' + this.currency + ')'});
    }
  }

  confirmOrder() {
    if (this.form.valid) {
      this.appService.sendOrder(this.form.value)
        .subscribe({
          next: (response: any) => {
            this.successDialogRef = this.dialog.open(this.popupSuccess);

            //Очищаем форму после скрытия формы
            this.successDialogRef.afterClosed()
              .subscribe((): void => {
                this.form.reset();
              });
          },
          error: (response) => {
            alert(response.error.message);
          },
        });
    }
  }

  changeCurrency() {
    let newCurrency = "$";
    let coefficient = 1;

    if (this.currency === "$") {
      newCurrency = "₽";
      coefficient = 80;
    } else if (this.currency === "₽") {
      newCurrency = "BYN";
      coefficient = 3;
    } else if (this.currency === "BYN") {
      newCurrency = "€";
      coefficient = 0.9;
    } else if (this.currency === "€") {
      newCurrency = "¥";
      coefficient = 7.3;
    } else if (this.currency === "¥") {
      newCurrency = "$";  // Возвращаемся к доллару
      coefficient = 1;
    }

    this.currency = newCurrency;

    this.productsData.forEach((item: any) => {
      item.price = +(item.basePrice * coefficient).toFixed(1);
    });
  }



  closeSuccessPopup(): void {
    this.successDialogRef?.close();
    this.router.navigate(['/']);
  }
}
