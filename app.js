const express = require('express');
const paypal = require('paypal-rest-sdk');
const morgan  = require('morgan');



paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AflhaR8nwJwMxQMEYHoR50gEeiXem62socEJR0hPVkHUepCK3H3Bu8QN6tev6WjGw_rz6zt6GmmHg_HR',
  'client_secret': 'EHCuKaemue--4ndUZzPEfXQzXqEY4ZDDolPcMb4MdkwbRB0EyPD9A7DRD5HuhH0J8Gv0vfG638taGvpI'
});

const app = express();

var amt = null;

app.get('/pay/:amt', (req, res) => {
   
    // amount received by frontend
    amt = req.params.amt;

    // config to paypal
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://192.168.15.44:4444/success",
          "cancel_url": "http://192.168.15.44:4444/cancel"
      },
      "transactions": [{
          // "item_list": {
          //     "items": [{
          //         "name": "FirebrandBBQ",
          //         "sku": "001",
          //         "price": amt,
          //         "currency": "USD",
          //         "quantity": 1
          //     }]
          // },
          "amount": {
              "currency": "USD",
              "total": amt
          },
          "description": "Firebrand BBQ Goodies!!"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });

  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log("payerId",payerId,"paymentId",paymentId) 
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": amt
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log("error",error.response);
          throw error;
      } else {
          res.sendFile(__dirname + "/success.html")
      }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


//for logging
app.use(morgan('tiny'));

const PORT = process.env.PORT || 4444 ;

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));