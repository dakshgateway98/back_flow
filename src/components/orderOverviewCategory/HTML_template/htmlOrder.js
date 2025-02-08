import { isEmpty } from "lodash";
import { formatPhoneNumber } from "../../../global/helpers";

var miniCupcakeArray = [19, 24, 195, 185];
var largeCupcakeArray = [18, 22, 192, 69];

var CC_CHOC = 0;
var CC_WHT = 0;
var CC_RED = 0;
var CC_BAN = 0;
var CC_LEM = 0;
var CC_BP = 0;
var CC_STRW = 0;
var CC_PNUT = 0;
var CC_PUMP = 0;
var CC_PUMPCHIP = 0;
var CC_ASSORT = 0;
var CC_CUSTOM = 0;

var CC_GFCHOC = 0;
var CC_GFWHITE = 0;
var CC_GFASSORT = 0;

var CC_VECHOC = 0;
var CC_VESTRW = 0;
var CC_VEWHITE = 0;
var CC_VEASSORT = 0;

var MCC_CHOC = 0;
var MCC_WHT = 0;
var MCC_RED = 0;
var MCC_BAN = 0;
var MCC_LEM = 0;
var MCC_BP = 0;
var MCC_STRW = 0;
var MCC_PNUT = 0;
var MCC_PUMP = 0;
var MCC_PUMPCHIP = 0;
var MCC_ASSORT = 0;
var MCC_CUSTOM = 0;

var MCC_GFCHOC = 0;
var MCC_GFWHITE = 0;
var MCC_GFASSORT = 0;

var MCC_VECHOC = 0;
var MCC_VESTRW = 0;
var MCC_VEWHITE = 0;
var MCC_VEASSORT = 0;

const orderTotalsFunc = (orderTotals, orderData) => {
  let total = "";
  if (orderTotals?.semi_custom_cake_count) {
    total += `<span>CC: ${orderTotals?.semi_custom_cake_count}</span>`;
  }
  if (orderTotals?.cupcakes_mini_count) {
    total += ` <span>MCC: ${orderTotals?.cupcakes_mini_count} </span>`;
  }
  if (orderTotals?.cupcakes_ve_count) {
    total += ` <span>VECC: ${orderTotals?.cupcakes_ve_count} </span>`;
  }
  if (orderTotals?.cupcakes_ve_mini_count) {
    total += ` <span>VEMCC: ${orderTotals?.cupcakes_ve_mini_count} </span>`;
  }
  if (orderTotals?.cupcakes_gf_count) {
    total += ` <span>GFCC: ${orderTotals?.cupcakes_gf_count} </span>`;
  }
  if (orderTotals?.cupcakes_gf_mini_count) {
    total += ` <span>GFMCC: ${orderTotals?.cupcakes_gf_mini_count} </span>`;
  }
  if (orderTotals?.standard_cake_count) {
    total += ` <span>STND-CK: ${orderTotals?.standard_cake_count} </span>`;
  }
  if (orderTotals?.semi_custom_cake_count) {
    total += ` <span>SEMI-CK: ${orderTotals?.semi_custom_cake_count} </span>`;
  }
  if (orderTotals?.custom_cake_count) {
    total += ` <span>CSTM-CK: ${orderTotals?.custom_cake_count} </span>`;
  }
  if (orderTotals?.cakeball_count) {
    total += ` <span>CB: ${orderTotals?.cakeball_count} </span>`;
  }
  if (orderTotals?.cookie_count) {
    total += ` <span>CO: ${orderTotals?.cookie_count} </span>`;
  }
  if (orderTotals?.gift_box_count) {
    total += ` <span>GBox: ${orderTotals?.gift_box_count} </span>`;
  }
  if (orderTotals?.retail_count) {
    total += ` <span>Retail: ${orderTotals?.retail_count} </span>`;
  }
  if (orderTotals?.item_error) {
    total += ` <span>Cnt Error: ${orderTotals?.item_error} </span>`;
  }
  if (orderData?.expanded_total_items) {
    total += `  <span>Total: ${orderData.expanded_total_items} </span>`;
  }

  return total;
};

const calculateDataFromModifiers = (item, givenID, arry) => {
  let sum = 0;

  if (
    item?.product?.category === arry[0] ||
    item?.product?.category === arry[1] ||
    item?.product?.category === arry[2] ||
    item?.product?.category === arry[3]
  ) {
    if (item?.modifieritems) {
      item?.modifieritems.forEach((modifieritem) => {
        if (modifieritem.modifier?.recipe) {
          modifieritem.modifier?.recipe.forEach((rec) => {
            if (parseInt(rec?.ingredient_id) === givenID) {
              sum += rec?.qty;
            }
          });
        }
      });
    }
  }
  return sum;
};

const calculateDataFromReceipe = (recipe, givenID, item, arry) => {
  let sum = 0;
  if (
    item?.product?.category === arry[0] ||
    item?.product?.category === arry[1] ||
    item?.product?.category === arry[2] ||
    item?.product?.category === arry[3]
  ) {
    recipe.forEach((rec) => {
      if (rec?.id === givenID) {
        sum += rec.quantity;
      }
    });
  }
  return sum;
};

const calculateDataForFlavours = (orderData, givenID, arry) => {
  let sum = 0;
  orderData?.items.forEach((item) => {
    if (item?.cake_items && !isEmpty(item?.cake_items)) {
      item?.cake_items.forEach((cake_item) => {
        if (
          cake_item?.product?.recipe &&
          !isEmpty(cake_item?.product?.recipe)
        ) {
          sum +=
            cake_item?.quantity *
            calculateDataFromReceipe(
              cake_item?.product?.recipe,
              givenID,
              cake_item,
              arry
            );
        } else {
          sum +=
            cake_item?.quantity *
            calculateDataFromModifiers(cake_item, givenID, arry);
        }
      });
    } else {
      if (item?.product?.recipe && !isEmpty(item?.product?.recipe)) {
        sum +=
          item?.quantity *
          calculateDataFromReceipe(item?.product?.recipe, givenID, item, arry);
      } else {
        sum += item?.quantity * calculateDataFromModifiers(item, givenID, arry);
      }
    }
  });
  return sum;
};

const orderTime = (date) => {
  if (date === "9:30") {
    return `10:00 - 1:00`;
  } else if (date === "10:00") {
    return `10:00 - 1:00`;
  } else if (date === "12:00") {
    return `12:00 - 3:00`;
  } else if (date === "14:00") {
    return `2:00 - 5:00`;
  } else if (date === "17:00") {
    return `4:00 - 7:00`;
  }
};

const dateHour = (pickup_time) => {
  const date = new Date(pickup_time).setTime(
    new Date(pickup_time).getTime() + 1 * 60 * 60 * 1000
  );

  const newDate = new Date(date)
    .toLocaleTimeString("en-US", { hour12: false })
    .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");

  return newDate;
};

const displaymodifieritems = (modifieritems) => {
  let modifier = "";
  if (!isEmpty(modifieritems)) {
    modifieritems.forEach((modiItem) => {
      modifier += `<div class="f15 boldo">
           <div>
           		${modiItem?.qty} - ${modiItem?.modifier?.name}
            </div>      
	    	</div>
		`;
    });
  }
  return modifier;
};

const displaySingleItem = (item) => {
  return `<tr class="bb">
            <td class="txtc bld p3 bb"> ${item?.quantity}</td>
            <td class="linetr p3 bb">
              <div class="bld" style="{{ gbox1 }}">
                ${item?.product?.name}
              </div>
              <div style="padding-left: 15px;">
			   
                ${displaymodifieritems(item?.modifieritems)}
                  
              </div>
            </td>
            <td class="txtr bb p3">$${item?.price.toFixed(2)}</td>
            <td class="txtr bld bb p3">
              $${(item?.price * item?.quantity).toFixed(2)}
            </td>
          </tr>`;
};

const displayItem = (items) => {
  let literalItem = "";
  if (!isEmpty(items)) {
    items.forEach((item) => {
      if (item?.cake_items) {
        item?.cake_items.forEach(
          (cakeItem) => (literalItem += displaySingleItem(cakeItem))
        );
      } else {
        literalItem += displaySingleItem(item);
      }
    });
  }
  return literalItem;
};

const displayCategory = (orderCategoryObj) => {
  let literalCategory = "";
  if (!isEmpty(orderCategoryObj)) {
    Object.entries(orderCategoryObj).forEach(
      ([itemName, items]) =>
        (literalCategory += `<tr class="bb">
        <td class="bb f12 p3">&nbsp;</td>
        <td colspan="3" class="f12 p3 bb">
           \\\\${itemName}\\\\
        </td>
      </tr>
      ${!isEmpty(items) ? displayItem(items) : ""}`)
    );
  }
  return literalCategory;
};

const countForCC = () => {
  let count = 0;
  if (
    CC_CHOC > 0 ||
    CC_WHT > 0 ||
    CC_RED > 0 ||
    CC_BAN > 0 ||
    CC_LEM > 0 ||
    CC_BP > 0 ||
    CC_STRW > 0 ||
    CC_PNUT > 0 ||
    CC_PUMP > 0 ||
    CC_PUMPCHIP > 0 ||
    CC_ASSORT > 0 ||
    CC_CUSTOM > 0 ||
    CC_GFCHOC > 0 ||
    CC_GFWHITE > 0 ||
    CC_GFASSORT > 0 ||
    CC_VECHOC > 0 ||
    CC_VESTRW > 0 ||
    CC_VEWHITE > 0 ||
    CC_VEASSORT > 0
  ) {
    count = 1;
  }
  return count;
};

const countForMCC = () => {
  let count = 0;
  if (
    MCC_CHOC > 0 ||
    MCC_WHT > 0 ||
    MCC_RED > 0 ||
    MCC_BAN > 0 ||
    MCC_LEM > 0 ||
    MCC_BP > 0 ||
    MCC_STRW > 0 ||
    MCC_PNUT > 0 ||
    MCC_PUMP > 0 ||
    MCC_PUMPCHIP > 0 ||
    MCC_ASSORT > 0 ||
    MCC_CUSTOM > 0 ||
    MCC_GFCHOC > 0 ||
    MCC_GFWHITE > 0 ||
    MCC_GFASSORT > 0 ||
    MCC_VECHOC > 0 ||
    MCC_VESTRW > 0 ||
    MCC_VEWHITE > 0 ||
    MCC_VEASSORT > 0
  ) {
    count = 1;
  }
  return count;
};
export const htmlOrder = (orderData, barcode, orderCategoryObj) => {
  let htmlString = `
  <!doctype html>
  <html>
  <head>
  <meta charset="utf-8">
  <title>Revel Order</title>
	  
	  <style type="text/css">
	  body, td, th, tr {
		  font-family: Tahoma, Geneva;
		  vertical-align:top;
		  text-align: left;
		  font-size: 16px;}
	  
	  body {transform: scale(1);}	
	  .t1 {font-size: 26px;}
	  .t2 {font-size: 20px;}
	  .t3 {font-size:18px; color:#999999;}
	  .t4 {font-size: 12px; border-bottom: solid 1px #666666; padding:5px 0 0 0; margin: 0 0 5px 0;}
	  .f6 {font-size:6px;}
    .f9 {font-size:9px;}
	  .f12 {font-size:12px;}
	  .f14 {font-size:14px;}
	  .f15 {font-size:15px;}
	  .f22 {font-size:22px;}
	  
	  .smltxt {line-height:6px;font-size:9px; display: block; padding: 1px 0;}
	  
	  .pa1 {padding:0 8px 4px 8px;}
	  .pa2 {padding:0 0 4px 0;}
	  .pt10 {padding-top:10px;}
	  .pt15 {padding-top:15px;}
	  .pt20 {padding-top:20px;}
	  .p0 {padding:0;}
	  .p8 {padding:8px;}
	  .p3 {padding:3px;}
	  .m0 {margin:0;}
	  .m4 {margin:4px;}
	  .mb {margin: 0 0 3px 0;}
	  .m10 {margin-bottom:10px;}
	  .bld {font-weight:bold;}
	  .bb {border-bottom: solid 1px #666666;}
	  .b9 {border: solid 1px #999999;}
	  .bn {border: none;}	
	  .txtl {text-align: left;}
	  .txtc {text-align: center;}
	  .txtr {text-align: right;}
	  
	  .linetr {word-break:break-all;}
	  .boldo {word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;}
	  
	  .dbox {display: grid; grid-template-rows:1; grid-template-columns: repeat(7, 1fr); font-size: 10px; border: 1px solid #000; text-align: center; margin-top: 5px;}
	  .dbox div {padding: 4px;}
	  .mon,.tues,.wed,.thu,.fri,.sat,.sun {background-color: #666; color: #fff;}
	  
	  .checks span {border: solid 1px #999999;display: inline-block; padding: 3px; height: 18px;}
  </style>
  </head>
  
  <body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="mb">
	  <tr class="pa1">
		  <td width="55%" class="t1">
  
				  NEW ORDER
		  
			  <style>.{{dday}} {background-color: #666; color: #fff;}</style>
		  </td>
		  <td width="45%" class="t1 txtr">
			  &nbsp;
				${
          orderData.dining_option === 2 ||
          orderData.order_totals.event_type === "Large Event"
            ? `DELIVERY`
            : `PICK UP`
        }
		  </td>
	  </tr>
		  
	   <tr class="pa2">
		  <td width="55%" style="padding:0px 8px 10px 4px;">
			  <div class="t4">Customer Info:</div> 
			  <div class="t1">${orderData.customer.first_name} ${
    orderData.customer.last_name
  } </div>       
			  <div>
				  Phone: ${formatPhoneNumber(orderData.customer.phone_number)} 
			  </div> 

         <div class="t4" style="display: flex; justify-content: space-between; ">  
			  <div class=" pt10">Shop Billing info :</div> 
         <div class=" pt10" style="margin-right : 57px">Shop Shipping info :</div> 

         </div>
         <div style="display: flex; justify-content: space-between; padding: 0 0 10px 0;">  
            <div>
             ${
               orderData.shopify_data?.billing?.name
                 ? orderData.shopify_data?.billing.name
                 : `<div style="margin-left: 60px">
                    -
                  
                  </div>
                  `
             }
               
          <div>    
            ${
              orderData?.shopify_data?.billing?.phone
                ? `Phone: ${formatPhoneNumber(
                    orderData.shopify_data?.billing?.phone
                  )}`
                : `<div style="margin-left: 60px;">
                    -
                  
                  </div>
                  `
            } 
          </div>
            </div>

            <div>
          <div> 
             ${
               orderData.shopify_data?.shipping?.name
                 ? orderData.shopify_data?.shipping.name
                 : `<div style="margin-right: 120px;">
                    -
                  
                  </div>
                  `
             }
          </div>
            <div>  
                 ${
                   orderData?.shopify_data?.shipping?.phone
                     ? `Phone: ${formatPhoneNumber(
                         orderData.shopify_data?.shipping?.phone
                       )}`
                     : `<div style="margin-right: 120px;">
                    -
                  
                  </div>
                  `
                 } 
            </div>

            </div>

         </div>


			  <div class="t4 pt10">Revel Order: </div> 
			  <div class="t2">#${orderData.local_id}</div> 
		  </td>
		  <td width="45%" style="padding: 0 8px 10px 4px;">
			
			  
			  ${
          orderData.dining_option === 2
            ? `<div class="t4">Delivery information:</div>
					  <div class="t1">
						  ${new Date(orderData.pickup_time).toDateString()}
					  </div>
				  <div class="t1">
					  <div>
					      ${orderTime(
                  new Date(orderData.pickup_time)
                    .toLocaleTimeString("en-US", { hour12: false })
                    .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")
                )}
						  </div>
				  </div>
					  <div class="t1">
            ${orderData.customer.first_name} 
            ${orderData.customer.last_name} 
					  </div>
			  `
            : `${
                orderData.order_totals.event_type === "Large Event"
                  ? ` <div class="t4">Delivery information:</div>
                    <div class="t1">${new Date(
                      orderData.pickup_time
                    ).toDateString()} <!-- Mon. Mar 9, 2022 --></div>
                  <div class="t1">
                    <div>${new Date(orderData.pickup_time)
                      .toLocaleTimeString("en-US", { hour12: false })
                      .replace(
                        /([\d]+:[\d]{2})(:[\d]{2})(.*)/,
                        "$1$3"
                      )} - ${dateHour(orderData.pickup_time)}   </div>
                  </div>
                    <div class="t1">${orderData.customer.first_name} ${
                      orderData.customer.last_name
                    } </div>`
                  : `<div class="t4">Pick up information:</div>
                    <div class="t1">${new Date(
                      orderData.pickup_time
                    ).toDateString()} <!-- Mon. Mar 9, 2022 --> </div>
                  <div class="t1">
                  ${new Date(orderData.pickup_time).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    }
                  )} <!-- 4:45 PM --> </div>  `
              }`
        }  
		  </td>
		</tr>
	  ${
      orderData.notes !== ""
        ? `<tr>
			<td colspan="2">		
				<table width="100%" style="border: 2px dotted #000000; padding: 3px; margin: 3px 0;">
					<tr>
					  <td width="65%" class="p8">
  						<div class="f9">"Any requests will be considered, are not guaranteed, and may incur additional costs."</div>
 							 ${orderData.notes}<br>			  	  
					  </td>
					  <td width="35%" class="f22 p8">ORDER NOTES! <br>READ THESE!</td>
					</tr>
				  </table>               
			   </td>
		  </tr>
	   `
        : ""
    }
	  
		  <tr class="pt10">
			  <td colspan="2" >
				  <div class="row">
					  <table width="100%" cellpadding="4" cellspacing="0" class="order-table table bb">
						<thead>
						  <tr class="f14 bb">
							<th width="5%" class="txtc bb p3" data-key="qty">Qty</th>
							<th width="72%" class="bb p3">Item</th>
							<th width="11%" class="txtr bb p3" data-key="price">Price Ea</th>
							<th width="12%" class="txtr bb p3" data-key="item_total" >Total</th>
						  </tr>
						</thead>
  
						<tbody>		  
					
  <script>  
  
  // LARGE CUPCAKES
							
   	${(CC_CHOC = calculateDataForFlavours(orderData, 4, largeCupcakeArray))}
   	${(CC_WHT = calculateDataForFlavours(orderData, 1, largeCupcakeArray))}
   	${(CC_RED = calculateDataForFlavours(orderData, 2, largeCupcakeArray))}
   	${(CC_BAN = calculateDataForFlavours(orderData, 5, largeCupcakeArray))}
   	${(CC_LEM = calculateDataForFlavours(orderData, 6, largeCupcakeArray))}
   	${(CC_BP = calculateDataForFlavours(orderData, 7, largeCupcakeArray))}
   	${(CC_STRW = calculateDataForFlavours(orderData, 89, largeCupcakeArray))}
   	${(CC_PNUT = calculateDataForFlavours(orderData, 8, largeCupcakeArray))}
   	${(CC_PUMP = calculateDataForFlavours(orderData, 26, largeCupcakeArray))}
   	${(CC_PUMPCHIP = calculateDataForFlavours(orderData, 27, largeCupcakeArray))}
   	${(CC_ASSORT = calculateDataForFlavours(orderData, 28, largeCupcakeArray))}
   	${(CC_CUSTOM = calculateDataForFlavours(orderData, 25, largeCupcakeArray))}
   	${(CC_GFCHOC = calculateDataForFlavours(orderData, 20, largeCupcakeArray))}
   	${(CC_GFWHITE = calculateDataForFlavours(orderData, 21, largeCupcakeArray))}
   	${(CC_GFASSORT = calculateDataForFlavours(orderData, 33, largeCupcakeArray))}
   	${(CC_VECHOC = calculateDataForFlavours(orderData, 81, largeCupcakeArray))}
   	${(CC_VESTRW = calculateDataForFlavours(orderData, 90, largeCupcakeArray))}
   	${(CC_VEWHITE = calculateDataForFlavours(orderData, 80, largeCupcakeArray))}
   	${(CC_VEASSORT = calculateDataForFlavours(orderData, 91, largeCupcakeArray))}

   // MINI CUPCAKES
	  
   ${(MCC_CHOC = calculateDataForFlavours(orderData, 4, miniCupcakeArray))}
   	${(MCC_WHT = calculateDataForFlavours(orderData, 1, miniCupcakeArray))}
   	${(MCC_RED = calculateDataForFlavours(orderData, 2, miniCupcakeArray))}
   	${(MCC_BAN = calculateDataForFlavours(orderData, 5, miniCupcakeArray))}
   	${(MCC_LEM = calculateDataForFlavours(orderData, 6, miniCupcakeArray))}
   	${(MCC_BP = calculateDataForFlavours(orderData, 7, miniCupcakeArray))}
   	${(MCC_STRW = calculateDataForFlavours(orderData, 89, miniCupcakeArray))}
   	${(MCC_PNUT = calculateDataForFlavours(orderData, 8, miniCupcakeArray))}
   	${(MCC_PUMP = calculateDataForFlavours(orderData, 26, miniCupcakeArray))}
   	${(MCC_PUMPCHIP = calculateDataForFlavours(orderData, 27, miniCupcakeArray))}
   	${(MCC_ASSORT = calculateDataForFlavours(orderData, 28, miniCupcakeArray))}
   	${(MCC_CUSTOM = calculateDataForFlavours(orderData, 25, miniCupcakeArray))}
   	${(MCC_GFCHOC = calculateDataForFlavours(orderData, 20, miniCupcakeArray))}
   	${(MCC_GFWHITE = calculateDataForFlavours(orderData, 21, miniCupcakeArray))}
   	${(MCC_GFASSORT = calculateDataForFlavours(orderData, 33, miniCupcakeArray))}
   	${(MCC_VECHOC = calculateDataForFlavours(orderData, 81, miniCupcakeArray))}
   	${(MCC_VESTRW = calculateDataForFlavours(orderData, 90, miniCupcakeArray))}
   	${(MCC_VEWHITE = calculateDataForFlavours(orderData, 80, miniCupcakeArray))}
   	${(MCC_VEASSORT = calculateDataForFlavours(orderData, 91, miniCupcakeArray))}

  </script>
						
  <!-- collapse -->
  	
  ${displayCategory(orderCategoryObj)}

	  </tbody>                          
		  </table>
	  </div>
		  </td>
		</tr>
		  <tr>	
			  <td colspan="2" class="txtr p8">
				  <span class="m4"><span class="f12">Discount:</span>(-)</span>
				  <span class="m4"><span class="f12">Subtotal:</span>(-)</span>             
				  <span class="m4"><span class="f12">Delivery</span>(-) </span>
				  <span class="m4"><span class="f12">Tax:</span> (-) </span>
				  <span class="m4"><span class="f12">Total:</span> $${orderData?.final_total.toFixed(
            2
          )}</span>
				  <span class="m4"><span class="f12">Balance:</span> $${orderData?.remaining_due.toFixed(
            2
          )}</span>
			  </td>
		  </tr>
  
	  </table>
     ${
       countForCC() > 0
         ? `<div class="b9 f18 m0 mb">
       &nbsp;CC FLVRS:
 
          ${CC_CHOC > 0 ? ` | CHOC: ${CC_CHOC}` : ""}
          ${CC_WHT > 0 ? ` | WHT: ${CC_WHT}` : ""}
          ${CC_RED > 0 ? ` | RED: ${CC_RED}` : ""}
          ${CC_BAN > 0 ? ` | BAN: ${CC_BAN}` : ""}
          ${CC_LEM > 0 ? ` | LEM: ${CC_LEM}` : ""}
          ${CC_BP > 0 ? ` | BP: ${CC_BP}` : ""}
          ${CC_STRW > 0 ? ` | STRW: ${CC_STRW}` : ""}
          ${CC_PNUT > 0 ? ` | PNUT: ${CC_PNUT}` : ""}
          ${CC_PUMP > 0 ? ` | PUMP: ${CC_PUMP}` : ""}
          ${CC_PUMPCHIP > 0 ? ` | PUMPCHIP: ${CC_PUMPCHIP}` : ""}
          ${CC_ASSORT > 0 ? ` | ASSORT: ${CC_ASSORT}` : ""}
          ${CC_CUSTOM > 0 ? ` | CUSTOM: ${CC_CUSTOM}` : ""}  
          ${CC_GFCHOC > 0 ? ` | GFCHOC: ${CC_GFCHOC}` : ""}           
          ${CC_GFWHITE > 0 ? ` | GFWHITE: ${CC_GFWHITE}` : ""}           
          ${CC_GFASSORT > 0 ? ` | GFASSORT: ${CC_GFASSORT}` : ""}           
          ${CC_VECHOC > 0 ? ` | VECHOC: ${CC_VECHOC}` : ""}           
          ${CC_VESTRW > 0 ? ` | VESTRW: ${CC_VESTRW}` : ""}           
          ${CC_VEWHITE > 0 ? ` | VEWHITE: ${CC_VEWHITE}` : ""}           
          ${CC_VEASSORT > 0 ? ` | VEASSORT: ${CC_VEASSORT}` : ""}             
           
   &nbsp;</div>`
         : ""
     }
	  	${
        countForMCC() > 0
          ? `<div class="b9 f18 mb">
        &nbsp;MCC FLVRS:
       
               ${MCC_CHOC > 0 ? ` | CHOC: ${MCC_CHOC}` : ""}
               ${MCC_WHT > 0 ? ` | WHT: ${MCC_WHT}` : ""}
               ${MCC_RED > 0 ? ` | RED: ${MCC_RED}` : ""}
               ${MCC_BAN > 0 ? ` | BAN: ${MCC_BAN}` : ""}
               ${MCC_LEM > 0 ? ` | LEM: ${MCC_LEM}` : ""}
               ${MCC_BP > 0 ? ` | BP: ${MCC_BP}` : ""}
               ${MCC_STRW > 0 ? ` | STRW: ${MCC_STRW}` : ""}
               ${MCC_PNUT > 0 ? ` | PNUT: ${MCC_PNUT}` : ""}
               ${MCC_PUMP > 0 ? ` | PUMP: ${MCC_PUMP}` : ""}
               ${MCC_PUMPCHIP > 0 ? ` | PUMPCHIP: ${MCC_PUMPCHIP}` : ""}
               ${MCC_ASSORT > 0 ? ` | ASSORT: ${MCC_ASSORT}` : ""}
               ${MCC_CUSTOM > 0 ? ` | CUSTOM: ${MCC_CUSTOM}` : ""}  
               ${MCC_GFCHOC > 0 ? ` | GFCHOC: ${MCC_GFCHOC}` : ""}           
               ${MCC_GFWHITE > 0 ? ` | GFWHITE: ${MCC_GFWHITE}` : ""}           
               ${
                 MCC_GFASSORT > 0 ? ` | GFASSORT: ${MCC_GFASSORT}` : ""
               }           
               ${MCC_VECHOC > 0 ? ` | VECHOC: ${MCC_VECHOC}` : ""}           
               ${MCC_VESTRW > 0 ? ` | VESTRW: ${MCC_VESTRW}` : ""}           
               ${MCC_VEWHITE > 0 ? ` | VEWHITE: ${MCC_VEWHITE}` : ""}           
               ${MCC_VEASSORT > 0 ? ` | VEASSORT: ${MCC_VEASSORT}` : ""}       
       
        &nbsp;</div>`
          : ""
      }  


     <div class="mb checks">        
       ${orderTotalsFunc(orderData?.order_totals, orderData)}
			   &nbsp;  
	  </div>
  
	  <div class="f12"> Placed: ${new Date(
      orderData?.created_date
    ).toDateString()} || Order ID: ${orderData?.id} || </div>
  
      <br>
	  <img src= ${barcode} width="200px" alt="Barcode">
  </body>
  </html> `;

  return htmlString;
};
