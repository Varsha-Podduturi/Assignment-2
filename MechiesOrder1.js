const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING:   Symbol("welcoming"),
  SIZE:   Symbol("size"),
  TOPPINGS:   Symbol("toppings"),
  ICECREAM: Symbol("icecream"),
  FLAVOR: Symbol("flavor"),
  CAKE: Symbol("cake"),
  CAKEFLAVOR: Symbol("cakeflavor"),
  PIECES: Symbol("pieces"),
  SHAKES:  Symbol("shakes"),
  PAYMENT: Symbol("payment")
});

module.exports = class MenchiesOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sToppings = "";
        this.sItem = "";
        this.sItem2 = "";
        this.sPieces = "";
        this.sFlavor = "";
        this.sCakeFlavor = "",
        this.sShakes = "";
        this.sUserReply = "";
        this.Order = [];
        this.totalOrder = {}
        this.CakePrice = 5;
        this.IceCreamPrice = 10;
        this.ShakePrice = 5;
        this.totalPrice = 0
        this.totalItems = []
        this.orderNumber = MenchiesOrder.orderNumber++;
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
          case OrderState.WELCOMING:
            if(sInput.toLowerCase() == "icecream" || sInput.toLowerCase() == 'both'){
                this.sUserReply = sInput;
                this.stateCur = OrderState.SIZE
                this.sItem = "Ice cream"
                this.totalItems.push(this.sItem)
                aReturn.push("Which Ice-cream Size would you like?")
                break
            }else if(sInput.toLowerCase() == "cake"){
                this.stateCur = OrderState.CAKEFLAVOR
                this.sItem2 = "Cake"
                this.totalItems.push(this.sItem2)
                aReturn.push("Which Flavor would you like?")
                break;
            }else{

                aReturn.push("Welcome to Menchies.");
                aReturn.push("What would you like icecream or cake or both?");
                break;
            }
        
        case OrderState.FLAVOR:
            this.stateCur = OrderState.TOPPINGS
            this.sFlavor = sInput;
            aReturn.push("What toppings would you like?");
            break;
        case OrderState.SIZE:
            this.stateCur = OrderState.FLAVOR
            this.sSize = sInput;
            aReturn.push("What Ice-cream Flavor would you like?");
            break;
        case OrderState.TOPPINGS:
            this.stateCur = OrderState.SHAKES
            this.sToppings = sInput;
            if(this.sUserReply == "both"){
                this.stateCur = OrderState.CAKEFLAVOR
                this.sItem2 = "Cake"
                this.totalItems.push(this.sItem2)
                aReturn.push("Which Cake Flavor would you like?")
                break
            }
            aReturn.push("Would you like shakes with that? If yes , Please mention the shake name");
            break;
        case OrderState.CAKEFLAVOR:
            this.stateCur = OrderState.PIECES
            this.sCakeFlavor = sInput,
            // this.sPieces = sInput;
            aReturn.push("How many pieces would you like to have?");
            break;
        case OrderState.PIECES:
            this.stateCur = OrderState.SHAKES
            this.sPieces = sInput;
            aReturn.push("Would you like shakes with that? If yes , Please mention the shake name");
            break;
        case OrderState.SHAKES:
          this.stateCur = OrderState.PAYMENT;
            this.isDone(true);
            if(sInput.toLowerCase() != "no"){
                this.sShakes = sInput;
                this.totalItems.push(this.sShakes)
            }
            aReturn.push("Thank-you for your order of");
            if(this.sItem != ""){

                aReturn.push(`${this.sFlavor} ${this.sItem}, ${this.sSize} with toppings- ${this.sToppings}`);
                let ice_creamOrder = {
                    item_name : this.sItem,
                    size: this.sSize,
                    flavor: this.sFlavor,
                    toppings : this.sToppings,
                    price: this.IceCreamPrice,

                }
                this.totalPrice += this.IceCreamPrice
                this.Order.push(ice_creamOrder)
            }
            if(this.sItem2 != ""){
                aReturn.push(`${this.sPieces} pieces of ${this.sItem2} with ${this.sCakeFlavor} flavor`);
                let cake_price = Number(this.sPieces) * this.CakePrice
                let cakeOrder = {
                    item_name : this.sItem2,
                    pieces: this.sPieces,
                    flavor: this.sCakeFlavor,
                    price: cake_price,

                }
                this.Order.push(cakeOrder)
                this.totalPrice += cake_price
                // console.log("inside handle",this.Order)
            }
            if(this.sShakes){
              let shakeOrder = {
                  item_name : this.sShakes,
                  price: this.ShakePrice

              }
              this.Order.push(shakeOrder)
              
              this.totalPrice += this.ShakePrice
              aReturn.push(`${this.sShakes}`)

          } 
          // this.Order.push({total_price : this.totalPrice})
          this.totalOrder[this.orderNumber] = this.Order
          
          aReturn.push(`Order total - $${this.totalPrice}`);
          aReturn.push(`Please pay for your order here`);
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
          break;

        case OrderState.PAYMENT:
                // console.log(sInput);
                // console.log("details:",sInput.payer)
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                const address = sInput.payer.address.country_code
                aReturn.push(`Your order will be delivered to ${address}`);
                aReturn.push(`at ${d.toTimeString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItemName = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItemName} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}        
