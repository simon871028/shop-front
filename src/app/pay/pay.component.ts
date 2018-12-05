import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Order } from './poducts';
import { ShopService } from '../shop.service';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.css']

})



export class PayComponent implements OnInit {
  c_email_address: string;
  c_fname: string;
  c_lname: string;
  c_address: string;
  c_phone: any;
  couponid: any;
  checkkk = false;
  c_companyname: string;
  totalCost: any;
  deliver: any;
  Total: any;
  pay: any;


  cartList: any;
  constructor(private ShopService: ShopService, private authService: AuthService) {
    let json = '[';
    let minus = 1;
    for (let i = 0, len = localStorage.length; i < len; i++) {
      if (localStorage.key(i) == 'token') {
        minus = 2;
      }
    }
    for (let i = 0, len = localStorage.length; i < len; i++) {
      if (localStorage.key(i) != 'token') {
        json += localStorage.getItem(localStorage.key(i)) + '';
        if (i !== len - minus) {
          json += ',';
        }
      }
    }
    json += ']';
    this.cartList = JSON.parse(json);

  }

  ngOnInit() {
  }

  check() {

    if (this.c_email_address.includes('@') && this.c_fname != null && this.c_lname != null && this.c_address != null && this.c_phone.length() === 10) {
      return 1;
    }
    else return 0;





  }

  Pay() {

    for (let i = 0; i < this.cartList.length; i++) {
      this.cartList[i]['paid'] = true;
      console.log(this.cartList[i].id);
      localStorage.setItem(localStorage.key(i), JSON.stringify(this.cartList[i]));
    }


    this.totalCost = function (): number {
      let total = 0;
      this.cartList.forEach(t => total += t.price * t.quantity);
      return total;
    };
    this.deliver = function (): number {
      let total = 0;
      let tmp = this.totalCost();
      if (tmp <= 10000) {
        total = 60;
      }
      return total;
    };
    this.Total = function (): number {
      return this.totalCost() + this.deliver();
    };

    this.authService.user_info().subscribe(data => {
      this.pay = {
        user_id: data['id'],
        couponid: this.couponid,
        amount: this.Total(),
        first_name: this.c_fname,
        last_name: this.c_lname,
        company_name: this.c_companyname,
        address: this.c_address,
        email: this.c_email_address,
        phone: this.c_phone,
        status: 'pay'
      };
      if (this.pay.couponid == null) {
        this.pay.couponid = null;
      }
      console.log(this.pay);

      this.ShopService.postOrder(this.pay).subscribe(datas => {

        console.log(datas['order_id']);

        for (let i = 0; i < this.cartList.length; i++) {
          let products = {
            order_id: datas['order_id'],
            product_id: this.cartList[i].id,
            quantity: this.cartList[i].quantity
          };
          this.ShopService.postProduct(products).subscribe(log => {
            console.log(log);
          });
        }
      });
    }
    );
    for (let i = 0, len = localStorage.length; i < len; i++) {
      if (localStorage.key(i) != 'token') {
        localStorage.removeItem(localStorage.key(i));
      }
    }

  }



}



