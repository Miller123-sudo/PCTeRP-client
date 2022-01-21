import ApiService from "./ApiServices";
import jsPDF from "jspdf";

// 1. Purchase Order, Product Receipt, Bill, Bill Payment
const PurchaseOrderPDF = {
  // PRODUCT RECEIVED PDF
  generateProductReceivedPDF(productReceivedId) {
    let vendor = "";
    let products = [];

    console.log("id", productReceivedId);
    ApiService.setHeader();
    ApiService.get("productReceipt/" + productReceivedId).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const productReceived = response.data.document;
        // console.log(productReceived);
        // products = productReceived.products

        ApiService.get("vendor/" + productReceived.vendor)
          .then((response) => {
            vendor = response.data.document;
            console.log(products);
            //
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 460, 90);
            doc.text(`${productReceived.effectiveDate?.slice(0, 10)}`, 490, 90);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            doc.setFont("bold");
            // doc.text("PO#:", 430, 95);
            //POO number
            doc.text(`${productReceived.name}`, 460, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);
            // doc.text("Website:", 40, 200);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Receive From:", 45, 190);
            doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(vendor.name, 43, 205);
            // doc.text(`${productReceived.vendor.address}`, 43, 230);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            // doc.setFontSize(12);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Ship To:", 360, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Product Receipt", 215, 40);
            let height = 200;

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 90 },
                2: { cellWidth: 80, halign: "right" },
                3: { cellWidth: 80, halign: "right" },
                4: { cellWidth: 80 },
              },
              body: productReceived.operations,
              columns: [
                { header: "Product", dataKey: "name" },
                { header: "Description", dataKey: "description" },
                {
                  header: "Demand Qty",
                  dataKey: "demandQuantity",
                  halign: "center",
                },
                {
                  header: "Received Qty",
                  dataKey: "doneQuantity",
                  halign: "center",
                },
                // { header: 'GST', dataKey: 'taxes' },
                // { header: 'Sub Total', dataKey: 'subTotal' },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Product Receipt - ${productReceived.name}.pdf`);
            //
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  },

  //BILL PDF
  generateBillPDF(billId) {
    ApiService.setHeader();
    ApiService.get("bill/forpdf/" + billId).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const bill = response.data.document;
        ApiService.get("vendor/" + bill.vendor).then((res) => {
          if (res.data.isSuccess) {
            console.log(res.data.document);
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 440, 110);
            doc.text(`${bill.billDate?.slice(0, 10)}`, 470, 110);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            // doc.setFont("bold");

            doc.text(bill.name ? bill.name : "", 440, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Bill To:", 45, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(`${res.data.document.name}`, 43, 205);
            doc.text(`${res.data.document.address}`, 43, 220);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            // doc.text("Source Document:", 360, 190);
            if (bill.sourceDocument) {
              doc.text(`${bill.sourceDocument.name}`, 440, 90);
            }

            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            // doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Bill", 260, 40);
            let height = 200;

            // Restructure line items
            let array = new Array();
            response?.data?.newinvoiceLines?.map((e) => {
              let obj = new Object();

              obj.productName = e.productName;
              obj.label = e.label;
              obj.accountName = e.accountName;
              obj.quantity = e.quantity;
              obj.unitPrice = e.unitPrice.toFixed(2);
              obj.taxes = e.taxes + "%";
              obj.subTotal = e.subTotal.toFixed(2);
              array.push(obj);
            });
            console.log(array);

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 88 },
                2: { cellWidth: 80, halign: "center" },
                3: { cellWidth: 50, halign: "right" },
                4: { cellWidth: 65 },
                5: { cellWidth: 60, halign: "right" },
                6: { cellWidth: 88, halign: "left" },
              },
              // body: response.data.newinvoiceLines,
              body: array,
              columns: [
                { header: "Product", dataKey: "productName" },
                { header: "Label", dataKey: "label" },
                // {
                //   header: "Account",
                //   dataKey: "accountName",
                //   halign: "center",
                // },
                { header: "Quantity", dataKey: "quantity", halign: "center" },
                { header: "Unit Price", dataKey: "unitPrice" },
                { header: "Taxes", dataKey: "taxes" },
                { header: "Amount", dataKey: "subTotal" },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;

            // Calculate taxes
            let totalTaxAmount = 0;
            bill.invoiceLines.map((e) => {
              totalTaxAmount += parseFloat((e.subTotal * e.taxes) / 100);
            });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text("CGST: ", 460, h);
            // doc.text(`${bill.estimation?.cgst}`, 490, h);
            doc.text(`${parseFloat(totalTaxAmount / 2).toFixed(2)}`, 490, h);
            doc.text("SGST: ", 460, h + 10);
            doc.text(
              `${parseFloat(totalTaxAmount / 2).toFixed(2)}`,
              490,
              h + 10
            );
            // doc.text("IGST: ", 460, h + 20);
            // doc.text(`${totalTaxAmount}`, 490, h + 20);
            doc.line(460, h + 30, 560, h + 30);
            console.log(parseFloat(totalTaxAmount / 2));
            console.log(parseFloat(totalTaxAmount / 2).toFixed(2));
            doc.text("Total: ", 460, h + 40);
            doc.text(`${parseFloat(bill.total).toFixed(2)}`, 490, h + 40);
            doc.line(460, h + 50, 560, h + 50);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Bill - ${bill.name}.pdf`);
          } else {
            alert("something wrong in geting vendor!!!");
          }
        });
      }
    });
  },

  //BILL PAYEMENT PDF
  // generateBillPaymentPDF(billPaymentId) {
  //     console.log(billPaymentId)
  //     ApiService.setHeader();
  //     ApiService.get('billPayment/' + billPaymentId).then(response => {
  //         console.log(response);
  //         if (response.data.isSuccess) {
  //             const billPayment = response.data.document;

  //             let Products = new Array();
  //             var doc = new jsPDF('p', 'pt', 'a4');

  //             doc.setDrawColor(0);
  //             doc.setFillColor(255, 255, 255);
  //             doc.rect(0, 0, 700, 40, "F");
  //             doc.setFontSize(12);
  //             doc.text("Date:", 430, 90);
  //             doc.text(`${billPayment.date?.slice(0, 10)}`, 460, 90);
  //             // doc.rect(460, 62, 90, 15);
  //             doc.setFontSize(17);
  //             doc.setFont("bold");
  //             // doc.text("PO#:", 430, 95);
  //             //POO number
  //             doc.text(`${billPayment.name}`, 460, 70);
  //             // doc.rect(460, 77, 90, 15);

  //             doc.setFontSize(22);
  //             // doc.setFont("times", "italic");
  //             doc.text("Company:", 40, 70);
  //             // doc.line(40, 68, 90, 68)
  //             doc.setFontSize(17);
  //             doc.text(`PBTI`, 138, 70);

  //             doc.setFontSize(12);
  //             doc.text("Address:", 40, 90);
  //             doc.setFontSize(9);
  //             doc.text("\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091", 90, 80);

  //             doc.setFontSize(12);
  //             doc.text("Phone:", 40, 140);
  //             doc.setFontSize(9);
  //             doc.text("8282822924", 80, 140);
  //             doc.setFontSize(12);
  //             doc.text("Website:", 40, 160);
  //             doc.setFontSize(9);
  //             doc.text("www.paapri.com", 90, 160);
  //             // doc.text("Website:", 40, 200);

  //             doc.setDrawColor(255, 0, 0);
  //             doc.setFillColor(102, 194, 255);
  //             doc.rect(40, 175, 200, 20, "F");
  //             doc.setFontSize(12);
  //             doc.setTextColor(0, 0, 0);
  //             doc.text("Billed To:", 45, 190);
  //             doc.setTextColor(0, 0, 0);
  //             doc.text("Name & Address:", 43, 210);
  //             doc.setFontSize(9);
  //             doc.text(`${billPayment.vendor.name}`, 43, 220);
  //             doc.text(`${billPayment.vendor.address}`, 43, 230);
  //             // doc.setDrawColor(255, 0, 0);
  //             // doc.setFillColor(102, 194, 255);
  //             // doc.rect(355, 175, 200, 20, "F");
  //             // doc.setFontSize(12);
  //             // doc.setTextColor(0, 0, 0);
  //             // doc.text("Ship To:", 360, 190);
  //             // doc.setTextColor(0, 0, 0);
  //             // doc.text("Name & Address:", 358, 210);
  //             doc.setFontSize(30);
  //             doc.setFont('Sans-serif');
  //             doc.setTextColor(255, 255, 255);
  //             doc.text("Print Bill", 220, 28);
  //             let height = 200;

  //             doc.autoTable({

  //                 margin: { top: 280 },
  //                 styles: {
  //                     lineColor: [102, 194, 255],
  //                     lineWidth: 1,
  //                     fillColor: [102, 194, 255],

  //                 },
  //                 columnStyles: {
  //                     europe: { halign: 'center' },
  //                     0: { cellWidth: 88 },
  //                     2: { cellWidth: 40, halign: 'center' },
  //                     3: { cellWidth: 57, halign: 'right' },
  //                     4: { cellWidth: 65 },
  //                     5: { cellWidth: 65, halign: 'right' },
  //                 },
  //                 body: billPayment.products,
  //                 columns: [
  //                     { header: 'Journal Type', dataKey: 'journalType' },
  //                     // { header: 'Cash', dataKey: 'cash' },
  //                     { header: 'Amount', dataKey: 'amount', halign: 'center' },
  //                     { header: 'Recipient Bank', dataKey: 'recipientBank', halign: 'center' },
  //                     { header: 'Payment Date', dataKey: 'paymentDate', halign: 'center' },
  //                     { header: 'Memo', dataKey: 'memo' },
  //                     // { header: 'Sub Total', dataKey: 'subTotal' },
  //                 ],
  //                 didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
  //             })

  //             let h = height + 30;

  //             doc.setTextColor(0, 0, 0);
  //             doc.setFontSize(10);
  //             const pageCount = doc.internal.getNumberOfPages();

  //             doc.text(`${pageCount}`, 300, 820);
  //             doc.save(`Bill Payment - ${billPayment.name}.pdf`);

  //         }

  //     })

  // },

  generatePurchaseOrderPDF(purchaseOrderId) {
    console.log(purchaseOrderId);

    ApiService.get("purchaseOrder/" + purchaseOrderId)
      .then((response) => {
        if (response.data.isSuccess) {
          const purchaseOrder = response.data.document;
          ApiService.get("vendor/" + purchaseOrder.vendor).then((res) => {
            if (res.data.isSuccess) {
              let products = new Array();
              var doc = new jsPDF("p", "pt", "a4");
              //header color
              doc.setDrawColor(0);
              doc.setFillColor(255, 255, 255);
              doc.rect(0, 0, 700, 40, "F");
              doc.setFontSize(12);
              doc.text("Date:", 460, 90);
              doc.text(`${purchaseOrder.date?.slice(0, 10)}`, 490, 90);
              // doc.rect(460, 62, 90, 15);
              doc.setFontSize(17);
              doc.setFont("bold");
              // doc.text("PO#:", 430, 95);
              //POO number
              doc.text(`${purchaseOrder.name}`, 460, 70);
              // doc.rect(460, 77, 90, 15);

              doc.setFontSize(22);
              // doc.setFont("times", "italic");
              doc.text("Company:", 40, 70);
              // doc.line(40, 68, 90, 68)
              doc.setFontSize(17);
              doc.text(`PBTI`, 138, 70);

              // doc.setFontSize(12);
              // doc.text("Address:", 40, 90);
              // doc.setFontSize(9);
              // doc.text("\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091", 90, 80);

              // doc.setFontSize(9);
              // doc.text("8282822924", 80, 140);
              doc.setFontSize(12);
              doc.text("Website:", 40, 90);
              doc.setFontSize(9);
              doc.text("www.paapri.com", 90, 90);
              // doc.text("Website:", 40, 200);

              doc.setDrawColor(255, 0, 0);
              doc.setFillColor(230, 230, 230);
              doc.rect(40, 175, 200, 20, "F");
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Vendor:", 45, 190);
              doc.setTextColor(0, 0, 0);
              // doc.text("Name & Address:", 45, 210);
              doc.setFontSize(9);
              doc.text(`${res.data.document.name}`, 43, 220);
              doc.text(`${res.data.document.address}`, 43, 230);
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Phone:", 42, 273);
              doc.text(`${res.data.document.phone}`, 78, 273);
              doc.setDrawColor(255, 0, 0);
              doc.setFillColor(230, 230, 230);
              doc.rect(355, 175, 200, 20, "F");
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Ship To:", 360, 190);
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(9);
              doc.text("Address :", 360, 210);
              doc.text(
                "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
                360,
                213
              );

              doc.setFontSize(9);
              // doc.text(`${purchaseOrder.name}`, 358, 220);
              // doc.text(`${purchaseOrder.address}`, 358, 230);
              doc.setFontSize(30);
              doc.setFont("Sans-serif");
              doc.setTextColor(0, 0, 0);
              doc.text("Purchase Order", 210, 40);
              let height = 200;

              // reconstract the line item array
              let array = new Array();
              purchaseOrder?.products?.map((e) => {
                let obj = new Object();

                obj.name = e.name;
                obj.description = e.description;
                obj.quantity = e.quantity;
                obj.unitPrice = e.unitPrice.toFixed(2);
                obj.taxes = e.taxes + "%";
                obj.subTotal = e.subTotal.toFixed(2);
                array.push(obj);
              });
              console.log(array);

              // Create the table of products data
              if (array.length) {
                doc.autoTable({
                  margin: { top: 280 },
                  styles: {
                    lineColor: [153, 153, 153],
                    lineWidth: 1,
                    fillColor: [179, 179, 179],
                  },
                  columnStyles: {
                    europe: { halign: "center" },
                    0: { cellWidth: 88 },
                    2: { cellWidth: 40, halign: "center" },
                    3: { cellWidth: 57, halign: "right" },
                    4: { cellWidth: 65 },
                    5: { cellWidth: 65, halign: "right" },
                  }, // European countries centered
                  // body: purchaseOrder.products,
                  body: array,
                  columns: [
                    { header: "Product", dataKey: "name" },
                    { header: "Description", dataKey: "description" },
                    { header: "Qty", dataKey: "quantity", halign: "center" },
                    {
                      header: "Unit Price",
                      dataKey: "unitPrice",
                      halign: "center",
                    },
                    { header: "GST", dataKey: "taxes" },
                    { header: "Amount", dataKey: "subTotal" },
                    // { header: 'Cgst', dataKey: 'cgst' },
                    // { header: 'Sgst', dataKey: 'sgst' },
                  ],
                  didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
                });
              } else {
                alert(
                  "issue in printing PO pdf. Please contact to your developer."
                );
              }

              let h = height + 30;

              // var formatter = new Intl.NumberFormat('en-in', {
              //     style: 'currency',
              //     currency: 'INR',
              // });

              // var currencyFormatted = formatter.format(purchaseOrder.estimation?.total);

              // doc.setTextColor(0, 0, 0);
              // doc.setFontSize(10);
              // doc.text("Total:", 460, h);
              // doc.text(`${purchaseOrder.estimation?.total}`, 490, h);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text("CGST:", 460, h);
              doc.text(`${purchaseOrder?.estimation?.cgst.toFixed(2)}`, 490, h);
              doc.text("SGST:", 460, h + 10);
              doc.text(
                `${purchaseOrder?.estimation?.sgst.toFixed(2)}`,
                490,
                h + 10
              );
              // doc.text("IGST:", 460, h + 20);
              // doc.text(`${purchaseOrder.estimation?.igst}`, 490, h + 20);
              doc.line(460, h + 30, 550, h + 30);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text("Total:", 460, h + 45);
              doc.text(
                `${purchaseOrder?.estimation?.total.toFixed(2)}`,
                490,
                h + 45
              );

              // doc.text("taxes:", 40, h);
              // doc.text('${}', 80, h);
              // doc.text(`Total: ${currencyFormatted}`, 380, h);
              const pageCount = doc.internal.getNumberOfPages();

              doc.text(`${pageCount}`, 300, 820);
              doc.save(`Purchase Order - ${purchaseOrder.name}.pdf`);
            } else {
              console.log("something wrong while get vendor value");
              alert("something wrong while get vendor value");
            }
          });
        } else {
          console.log(
            "Something went wrong while generating purchase order pdf"
          );
          alert("Something went wrong while generating purchase order pdf");
        }
      })
      .catch((e) => {
        console.log(e);
        alert(e);
      });
  },

  generateStandaloneBillPDF(billId) {
    ApiService.setHeader();
    ApiService.get("bill/forpdf/" + billId).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const bill = response.data.document;
        ApiService.get("vendor/" + bill.vendor).then((res) => {
          if (res.data.isSuccess) {
            console.log(res.data.document);
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 440, 110);
            doc.text(`${bill.billDate?.slice(0, 10)}`, 470, 110);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            // doc.setFont("bold");

            doc.text(bill.name ? bill.name : "", 440, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Bill To:", 45, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(`${res.data.document.name}`, 43, 205);
            doc.text(`${res.data.document.address}`, 43, 220);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            // doc.text("Source Document:", 360, 190);
            if (bill.sourceDocument) {
              doc.text(`${bill.sourceDocument.name}`, 440, 90);
            }

            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            // doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Bill", 260, 40);
            let height = 200;

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 88 },
                2: { cellWidth: 80, halign: "center" },
                3: { cellWidth: 50, halign: "right" },
                4: { cellWidth: 65 },
                5: { cellWidth: 40, halign: "right" },
                6: { cellWidth: 88, halign: "left" },
              },
              body: response.data.newinvoiceLines,
              columns: [
                { header: "Product", dataKey: "productName" },
                { header: "Label", dataKey: "label" },
                {
                  header: "Account",
                  dataKey: "accountName",
                  halign: "center",
                },
                { header: "Quantity", dataKey: "quantity", halign: "center" },
                { header: "Unit Price", dataKey: "unitPrice" },
                { header: "Taxes", dataKey: "taxes" },
                { header: "Sub Total", dataKey: "subTotal" },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;

            // Calculate taxes
            let totalTaxAmount = 0;
            bill.invoiceLines.map((e) => {
              totalTaxAmount += parseFloat((e.subTotal * e.taxes) / 100);
            });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text("CGST: ", 460, h);
            // doc.text(`${bill.estimation?.cgst}`, 490, h);
            doc.text(`${parseFloat(totalTaxAmount / 2).toFixed(2)}`, 490, h);
            doc.text("SGST: ", 460, h + 10);
            doc.text(
              `${parseFloat(totalTaxAmount / 2).toFixed(2)}`,
              490,
              h + 10
            );
            // doc.text("IGST: ", 460, h + 20);
            // doc.text(`${totalTaxAmount}`, 490, h + 20);
            doc.line(460, h + 30, 490, h + 30);
            console.log(parseFloat(totalTaxAmount / 2));
            console.log(parseFloat(totalTaxAmount / 2).toFixed(2));
            doc.text("Total: ", 460, h + 40);
            doc.text(`${parseFloat(bill.total).toFixed(2)}`, 490, h + 40);
            doc.line(460, h + 50, 490, h + 50);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Bill - ${bill.name}.pdf`);
          } else {
            alert("something wrong in geting vendor!!!");
          }
        });
      }
    });
  },
};

const SalesOrderPDF = {
  generateSalesOrderPDF(salesOrderId) {
    console.log(salesOrderId);
    ApiService.setHeader();
    ApiService.get("salesOrder/" + salesOrderId)
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(salesOrderId);
          const salesOrder = response.data.document;
          // ApiService.get("customer/" + salesOrder.customer).then((res) => {
          //   if (res.data.isSuccess) {
          let products = new Array();
          var doc = new jsPDF("p", "pt", "a4");
          //header color
          doc.setDrawColor(0);
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 700, 40, "F");
          doc.setFontSize(12);
          doc.text("Date:", 430, 90);
          doc.text(`${salesOrder.date?.slice(0, 10)}`, 460, 90);
          doc.text("Delivery Date:", 380, 110);
          doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
          // doc.rect(460, 62, 90, 15);
          doc.setFontSize(17);
          doc.setFont("bold");
          // doc.text("PO#:", 430, 95);
          //POO number
          doc.text(`${salesOrder.name}`, 460, 70);
          // doc.rect(460, 77, 90, 15);

          doc.setFontSize(22);
          // doc.setFont("times", "italic");
          doc.text("Company:", 40, 70);
          // doc.line(40, 68, 90, 68)
          doc.setFontSize(17);
          doc.text(`PBTI`, 138, 70);

          doc.setFontSize(12);
          doc.text("Address:", 40, 90);
          doc.setFontSize(9);
          doc.text(
            "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
            90,
            80
          );

          doc.setFontSize(12);
          doc.text("Phone:", 40, 140);
          doc.setFontSize(9);
          doc.text("8282822924", 80, 140);
          doc.setFontSize(12);
          doc.text("Website:", 40, 160);
          doc.setFontSize(9);
          doc.text("www.paapri.com", 90, 160);
          // doc.text("Website:", 40, 200);
          doc.setDrawColor(255, 0, 0);
          doc.setFillColor(230, 230, 230);
          doc.rect(40, 175, 200, 20, "F");
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Customer Name:", 45, 190);
          doc.setTextColor(0, 0, 0);
          // doc.text("Name & Address:", 43, 210);
          doc.text(`${salesOrder.customer[0].name}`, 47, 220);

          // doc.setFontSize(9);
          // doc.text(`${salesOrder}`, 43, 220);
          // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
          doc.setDrawColor(255, 0, 0);
          doc.setFillColor(230, 230, 230);
          doc.rect(355, 175, 200, 20, "F");
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Ship To:", 360, 190);
          doc.setTextColor(0, 0, 0);
          // doc.text("Name & Address:", 358, 210);
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          // doc.text(`${salesOrder.customerName}`, 400, 220);
          doc.text(`${salesOrder.shippingAddress}`, 358, 230);
          doc.setFontSize(30);
          doc.setFont("Sans-serif");
          doc.setTextColor(0, 0, 0);
          doc.text("Sales Order", 215, 40);
          let height = 200;

          // Restructure line items
          let array = new Array();
          salesOrder?.products.map(async (e) => {
            let obj = new Object();

            obj.name = e.product[0].name;
            obj.description = e.description;
            obj.quantity = e.quantity;
            obj.delivered = e.delivered;
            obj.invoiced = e.invoiced;
            obj.unitPrice = e.unitPrice.toFixed(2);
            obj.taxes = e.taxes + "%";
            obj.subTotal = e.subTotal.toFixed(2);
            array.push(obj);
          });
          console.log(salesOrder?.products);
          console.log(array);

          // Create the table of products data
          doc.autoTable({
            margin: { top: 280 },
            styles: {
              lineColor: [153, 153, 153],
              lineWidth: 1,
              fillColor: [179, 179, 179],
            },
            columnStyles: {
              europe: { halign: "center" },
              0: { cellWidth: 88 },
              1: { cellWidth: 100, halign: "center" },
              2: { cellWidth: 50, halign: "center" },
              3: { cellWidth: 57, halign: "left" },
              4: { cellWidth: 65 },
              5: { cellWidth: 65, halign: "right" },
              6: { cellWidth: 57, halign: "right" },
              7: { cellWidth: 65, halign: "right" },

              // 6: { cellWidth: 65, halign: 'right' },
              // 7: { cellWidth: 65, halign: 'right' },
            }, // European countries centered
            // body: salesOrder.products,
            body: array,
            columns: [
              { header: "Product", dataKey: "name" },
              { header: "Description", dataKey: "description" },
              {
                header: "Qty",
                dataKey: "quantity",
                halign: "center",
                valign: "center",
              },
              { header: "Delivered", dataKey: "delivered" },
              { header: "Invoiced", dataKey: "invoiced", halign: "center" },
              {
                header: "Unit Rate",
                dataKey: "unitPrice",
                halign: "center",
              },
              { header: "Taxes(%)", dataKey: "taxes", halign: "right" },
              {
                header: "Amount",
                dataKey: "subTotal",
                halign: "center",
              },
            ],
            didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
          });

          let h = height + 30;

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          // doc.text("Subtotal:", 490, h);
          // doc.text(
          //   `${(
          //     salesOrder?.estimation?.total -
          //     (salesOrder?.estimation?.cgst + salesOrder?.estimation?.sgst)
          //   ).toFixed(2)}`,
          //   490,
          //   h
          // );
          doc.text("CGST:", 460, h);
          doc.text(`${salesOrder.estimation?.cgst.toFixed(2)}`, 490, h);
          doc.text("SGST:", 460, h + 10);
          doc.text(`${salesOrder.estimation?.sgst.toFixed(2)}`, 490, h + 10);
          // doc.text("IGST:", 460, h + 20);
          // doc.text(`${salesOrder.estimation?.igst}`, 490, h + 20);
          doc.line(460, h + 30, 500, h + 30);

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.text("Total:", 460, h + 45);
          doc.text(`${salesOrder.estimation?.total.toFixed(2)}`, 490, h + 45);
          const pageCount = doc.internal.getNumberOfPages();

          doc.text(`${pageCount}`, 300, 820);
          doc.save(`Sales Order - ${salesOrder.name}.pdf`);
          // } else {
          //   console.log(
          //     "Something went wrong while generating purchase order pdf"
          //   );
          // }
          // });
        } else {
          console.log(
            "Something went wrong while generating purchase order pdf"
          );
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },

  generateInvoicePdDF(id) {
    ApiService.setHeader();
    ApiService.get("invoice/getInvoiceForPdf/" + id)
      .then((res) => {
        if (res.data.isSuccess) {
          const inv = res.data.document;
          console.log(inv);

          var doc = new jsPDF("p", "pt", "a4");
          //header color
          doc.setDrawColor(0);
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 700, 40, "F");
          doc.setFontSize(12);
          doc.text("Date:", 430, 90);
          doc.text(`${inv.invoiceDate?.slice(0, 10)}`, 460, 90);
          // doc.text("Delivery Date:", 380, 110);
          // doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
          // doc.rect(460, 62, 90, 15);
          doc.setFontSize(13);
          doc.setFont("bold");
          // doc.text("PO#:", 430, 95);
          //POO number
          doc.text(`${inv.name}`, 400, 70);
          // doc.rect(460, 77, 90, 15);

          doc.setFontSize(22);
          // doc.setFont("times", "italic");
          doc.text("Company:", 40, 70);
          // doc.line(40, 68, 90, 68)
          doc.setFontSize(17);
          doc.text(`PBTI`, 138, 70);

          doc.setFontSize(12);
          doc.text("Address:", 40, 90);
          doc.setFontSize(9);
          doc.text(
            "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
            90,
            80
          );

          doc.setFontSize(12);
          doc.text("Phone:", 40, 140);
          doc.setFontSize(9);
          doc.text("8282822924", 80, 140);
          doc.setFontSize(12);
          doc.text("Website:", 40, 160);
          doc.setFontSize(9);
          doc.text("www.paapri.com", 90, 160);
          // doc.text("Website:", 40, 200);
          doc.setDrawColor(255, 0, 0);
          doc.setFillColor(230, 230, 230);
          doc.rect(40, 175, 200, 20, "F");
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Customer Name:", 45, 190);
          doc.setTextColor(0, 0, 0);
          doc.text(`${inv.customer.name}`, 43, 210);
          doc.setFontSize(9);
          // doc.text(`${salesOrder.billingAddress}`, 43, 220);
          // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
          doc.setDrawColor(255, 0, 0);
          doc.setFillColor(230, 230, 230);
          doc.rect(355, 175, 200, 20, "F");
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Ship To:", 360, 190);
          doc.setTextColor(0, 0, 0);
          doc.text(`${inv.customer.address}`, 358, 210);
          doc.setFontSize(9);
          // doc.text(`${salesOrder.shippingAddress}`, 358, 220);
          doc.setFontSize(30);
          doc.setFont("Sans-serif");
          doc.setTextColor(0, 0, 0);
          doc.text("Invoice", 252, 40);
          let height = 200;

          // Restructure line items
          let array = new Array();
          res?.data?.newinvoiceLines?.map(async (e) => {
            let obj = new Object();

            obj.productName = e.productName;
            obj.label = e.label;
            obj.quantity = e.quantity;
            obj.unitPrice = e.unitPrice.toFixed(2);
            obj.subTotal = e.subTotal.toFixed(2);
            array.push(obj);
          });

          // Create the table of items data
          doc.autoTable({
            margin: { top: 220 },
            styles: {
              lineColor: [153, 153, 153],
              lineWidth: 0.5,
              fillColor: [179, 179, 179],
            },
            columnStyles: {
              europe: { halign: "center" },
              0: { cellWidth: 88 },
              2: { cellWidth: 40 },
              3: { cellWidth: 57 },
              4: { cellWidth: 65 },
            }, // European countries centered
            // body: res.data.newinvoiceLines,
            body: array,
            columns: [
              { header: "Product", dataKey: "productName" },
              { header: "Label", dataKey: "label" },
              { header: "Qty", dataKey: "quantity" },
              { header: "UnitPrice", dataKey: "unitPrice" },
              { header: "Amount", dataKey: "subTotal" },
            ],
            didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
          });

          let h = height + 30;

          var formatter = new Intl.NumberFormat("en-in", {
            style: "currency",
            currency: "INR",
          });

          // var currencyFormatted = formatter.format(inv.estimation.total);
          // var currencyFormatted = formatter.format(inv.total);

          // doc.setTextColor(0, 0, 0);
          // doc.setFontSize(10);
          // doc.text(`Total: ${currencyFormatted}`, 380, h);

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.text("Tax Total:", 440, h + 35);
          doc.text(`${inv.totalTaxAmount?.toFixed(2)}`, 495, h + 35);
          doc.text("Total:", 460, h + 45);
          doc.text(`${inv.total.toFixed(2)}`, 495, h + 45);
          const pageCount = doc.internal.getNumberOfPages();

          doc.text(`${pageCount}`, 300, 820);
          doc.save(`INVOICE - ${inv.name}.pdf`);
        } else {
          console.log(
            "Something went wrong while generating purchase order pdf"
          );
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },

  generateStandaloneInvoicePdDF(id) {
    ApiService.setHeader();
    // ApiService.get("invoice/" + id)
    ApiService.get("invoice/getInvoiceForPdf/" + id)
      .then((res) => {
        if (res.data.isSuccess) {
          const inv = res.data.document;
          const invLines = res.data.newinvoiceLines;
          console.log(res);
          ApiService.get(`customer/${inv.customer.id}`)
            .then((res) => {
              if (res.data.isSuccess) {
                console.log(res.data.document);
                var doc = new jsPDF("p", "pt", "a4");
                //header color
                doc.setDrawColor(0);
                doc.setFillColor(255, 255, 255);
                doc.rect(0, 0, 700, 40, "F");
                doc.setFontSize(12);
                doc.text("Date:", 430, 90);
                doc.text(`${inv.invoiceDate?.slice(0, 10)}`, 460, 90);
                // doc.text("Delivery Date:", 380, 110);
                // doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
                // doc.rect(460, 62, 90, 15);
                doc.setFontSize(13);
                doc.setFont("bold");
                // doc.text("PO#:", 430, 95);
                //POO number
                doc.text(`${inv.name}`, 400, 70);
                // doc.rect(460, 77, 90, 15);

                doc.setFontSize(22);
                // doc.setFont("times", "italic");
                doc.text("Company:", 40, 70);
                // doc.line(40, 68, 90, 68)
                doc.setFontSize(17);
                doc.text(`PBTI`, 138, 70);

                doc.setFontSize(12);
                doc.text("Address:", 40, 90);
                doc.setFontSize(9);
                doc.text(
                  "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
                  90,
                  80
                );

                doc.setFontSize(12);
                doc.text("Phone:", 40, 140);
                doc.setFontSize(9);
                // doc.text("8282822924", 80, 140);
                doc.text(`${res.data.document.phone}`, 80, 140);
                doc.setFontSize(12);
                doc.text("Website:", 40, 160);
                doc.setFontSize(9);
                doc.text("www.paapri.com", 90, 160);
                // doc.text("Website:", 40, 200);
                doc.setDrawColor(255, 0, 0);
                doc.setFillColor(230, 230, 230);
                doc.rect(40, 175, 200, 20, "F");
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text("Customer Name:", 45, 190);
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text(`${res.data.document.name}`, 43, 210);
                doc.setFontSize(9);
                // doc.text(`${salesOrder.billingAddress}`, 43, 220);
                // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
                doc.setDrawColor(255, 0, 0);
                doc.setFillColor(230, 230, 230);
                doc.rect(355, 175, 200, 20, "F");
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text("Ship To:", 360, 190);
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text(`${res.data.document.address}`, 358, 210);
                doc.setFontSize(9);
                // doc.text(`${salesOrder.shippingAddress}`, 358, 220);
                doc.setFontSize(30);
                doc.setFont("Sans-serif");
                doc.setTextColor(0, 0, 0);
                doc.text("Invoice", 215, 40);
                let height = 200;

                // let itemObjects = new Array();
                // // console.log(inv.invoiceLines);
                // inv.invoiceLines.map(async (item) => {
                //   let newObject = new Object();
                //   let itemData = await ApiService.get(
                //     `product/${item.product}`
                //   );

                //   newObject.product = itemData.data.document.name;
                //   newObject.label = item.label;
                //   newObject.quantity = item.quantity;
                //   newObject.unitPrice = item.unitPrice;
                //   newObject.subTotal = item.subTotal;
                //   newObject.totalAfterTax =
                //     item.subTotal + (item.subTotal * item.taxes) / 100;

                //   // console.log(itemData.data.document.name);
                //   // console.log(newObject);
                //   itemObjects.push(newObject);
                // });

                // Create the table of items data
                doc.autoTable({
                  margin: { top: 220 },
                  styles: {
                    lineColor: [153, 153, 153],
                    lineWidth: 0.5,
                    fillColor: [179, 179, 179],
                  },
                  columnStyles: {
                    europe: { halign: "center" },
                    0: { cellWidth: 88 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 57 },
                    4: { cellWidth: 65 },
                  }, // European countries centered
                  body: invLines,
                  columns: [
                    { header: "Product", dataKey: "productName" },
                    { header: "Label", dataKey: "label" },
                    { header: "Qty", dataKey: "quantity" },
                    { header: "UnitPrice", dataKey: "unitPrice" },
                    { header: "Amount", dataKey: "subTotal" },
                  ],
                  didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
                });

                let h = height + 30;

                var formatter = new Intl.NumberFormat("en-in", {
                  style: "currency",
                  currency: "INR",
                });

                // var currencyFormatted = formatter.format(inv.estimation.total);
                // var currencyFormatted = formatter.format(inv.total);

                // doc.setTextColor(0, 0, 0);
                // doc.setFontSize(10);
                // doc.text(`Total: ${currencyFormatted}`, 380, h);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.text("CGST:", 460, h);
                doc.text(`${inv.estimation?.cgst.toFixed(2)}`, 490, h);
                doc.text("SGST:", 460, h + 10);
                doc.text(`${inv.estimation?.sgst.toFixed(2)}`, 490, h + 10);
                // doc.text("IGST:", 460, h + 20);
                // doc.text(`${inv.estimation?.igst}`, 490, h + 20);
                doc.line(460, h + 30, 490, h + 30);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(12);
                doc.text("Total:", 460, h + 45);
                doc.text(`${inv.estimation?.total.toFixed(2)}`, 490, h + 45);
                const pageCount = doc.internal.getNumberOfPages();

                doc.text(`${pageCount}`, 300, 820);
                doc.save(`INVOICE - ${inv.name}.pdf`);
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          alert("Something went wrong while generating Invoice order pdf");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },

  generateDeliveryPDF(id) {
    ApiService.setHeader();
    ApiService.get("productDelivery/" + id).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const bill = response.data.document;
        ApiService.get("customer/" + bill.customer).then((res) => {
          if (res.data.isSuccess) {
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 440, 110);
            doc.text(`${bill.effectiveDate?.slice(0, 10)}`, 470, 110);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            doc.setFont("bold");

            doc.text(`${bill.name}`, 440, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Ship To:", 45, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(`${res.data.document.name}`, 43, 205);
            // doc.text(`${bill.vendor.address}`, 43, 220);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            // doc.text("Source Document:", 360, 190);
            doc.text(`${bill.sourceDocument.name}`, 440, 90);

            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Product Delivery", 210, 40);
            let height = 200;

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 0.5,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 88 },
                2: { cellWidth: 100, halign: "center" },
                3: { cellWidth: 100, halign: "center" },
              },
              body: bill.operations,
              columns: [
                { header: "Product", dataKey: "name" },
                { header: "Description", dataKey: "description" },
                {
                  header: "Demand Quantity",
                  dataKey: "demandQuantity",
                  halign: "center",
                },
                {
                  header: "Delivered Quantity",
                  dataKey: "doneQuantity",
                  halign: "center",
                },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Product Delivery - ${bill.name}.pdf`);
          } else {
            alert("Something is wrong in geting customer!!!");
          }
        });
      }
    });
  },
};

export { PurchaseOrderPDF, SalesOrderPDF };

//...............OLD CODE................

// import ApiService from "./ApiServices";
// import jsPDF from "jspdf";

// // 1. Purchase Order, Product Receipt, Bill, Bill Payment
// const PurchaseOrderPDF = {
//   // PRODUCT RECEIVED PDF
//   generateProductReceivedPDF(productReceivedId) {
//     let vendor = "";
//     let products = [];

//     console.log("id", productReceivedId);
//     ApiService.setHeader();
//     ApiService.get("productReceipt/" + productReceivedId).then((response) => {
//       console.log(response);
//       if (response.data.isSuccess) {
//         const productReceived = response.data.document;
//         // console.log(productReceived);
//         // products = productReceived.products

//         ApiService.get("vendor/" + productReceived.vendor)
//           .then((response) => {
//             vendor = response.data.document;
//             console.log(products);
//             //
//             let Products = new Array();
//             var doc = new jsPDF("p", "pt", "a4");

//             doc.setDrawColor(0);
//             doc.setFillColor(255, 255, 255);
//             doc.rect(0, 0, 700, 40, "F");
//             doc.setFontSize(12);
//             doc.text("Date:", 460, 90);
//             doc.text(`${productReceived.effectiveDate?.slice(0, 10)}`, 490, 90);
//             // doc.rect(460, 62, 90, 15);
//             doc.setFontSize(17);
//             doc.setFont("bold");
//             // doc.text("PO#:", 430, 95);
//             //POO number
//             doc.text(`${productReceived.name}`, 460, 70);
//             // doc.rect(460, 77, 90, 15);

//             doc.setFontSize(22);
//             // doc.setFont("times", "italic");
//             doc.text("Company:", 40, 70);
//             // doc.line(40, 68, 90, 68)
//             doc.setFontSize(17);
//             doc.text(`PBTI`, 138, 70);

//             doc.setFontSize(12);
//             doc.text("Address:", 40, 90);
//             doc.setFontSize(9);
//             doc.text(
//               "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
//               90,
//               80
//             );

//             doc.setFontSize(12);
//             doc.text("Phone:", 40, 140);
//             doc.setFontSize(9);
//             doc.text("8282822924", 80, 140);
//             doc.setFontSize(12);
//             doc.text("Website:", 40, 160);
//             doc.setFontSize(9);
//             doc.text("www.paapri.com", 90, 160);
//             // doc.text("Website:", 40, 200);

//             doc.setDrawColor(255, 0, 0);
//             doc.setFillColor(230, 230, 230);
//             doc.rect(40, 175, 200, 20, "F");
//             doc.setFontSize(12);
//             doc.setTextColor(0, 0, 0);
//             doc.text("Receive From:", 45, 190);
//             doc.setTextColor(0, 0, 0);
//             // doc.text("Name:", 43, 210);
//             doc.setFontSize(9);
//             doc.text(vendor.name, 43, 205);
//             // doc.text(`${productReceived.vendor.address}`, 43, 230);
//             // doc.setDrawColor(255, 0, 0);
//             // doc.setFillColor(230, 230, 230);
//             // doc.rect(355, 175, 200, 20, "F");
//             // doc.setFontSize(12);
//             // doc.setTextColor(0, 0, 0);
//             // doc.text("Ship To:", 360, 190);
//             // doc.setTextColor(0, 0, 0);
//             // doc.text("Name & Address:", 358, 210);
//             doc.setFontSize(30);
//             doc.setFont("Sans-serif");
//             doc.setTextColor(0, 0, 0);
//             doc.text("Product Receipt", 215, 40);
//             let height = 200;

//             doc.autoTable({
//               margin: { top: 280 },
//               styles: {
//                 lineColor: [153, 153, 153],
//                 lineWidth: 0.5,
//                 fillColor: [179, 179, 179],
//               },
//               columnStyles: {
//                 europe: { halign: "center" },
//                 0: { cellWidth: 90 },
//                 2: { cellWidth: 80, halign: "right" },
//                 3: { cellWidth: 80, halign: "right" },
//                 4: { cellWidth: 80 },
//               },
//               body: productReceived.operations,
//               columns: [
//                 { header: "Product", dataKey: "product" },
//                 { header: "Description", dataKey: "description" },
//                 {
//                   header: "DemandQty",
//                   dataKey: "demandQuantity",
//                   halign: "center",
//                 },
//                 {
//                   header: "ReceivedQty",
//                   dataKey: "receivedQuantity",
//                   halign: "center",
//                 },
//                 // { header: 'GST', dataKey: 'taxes' },
//                 // { header: 'Sub Total', dataKey: 'subTotal' },
//               ],
//               didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
//             });

//             let h = height + 30;
//             doc.setTextColor(0, 0, 0);
//             doc.setFontSize(10);
//             const pageCount = doc.internal.getNumberOfPages();

//             doc.text(`${pageCount}`, 300, 820);

//             doc.save(`Product Receipt - ${productReceived.name}.pdf`);
//             //
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//         // let Products = new Array();
//         // var doc = new jsPDF('p', 'pt', 'a4');

//         // doc.setDrawColor(0);
//         // doc.setFillColor(255, 255, 255);
//         // doc.rect(0, 0, 700, 40, "F");
//         // doc.setFontSize(12);
//         // doc.text("Date:", 430, 90);
//         // doc.text(`${productReceived.date?.slice(0, 10)}`, 460, 90);
//         // // doc.rect(460, 62, 90, 15);
//         // doc.setFontSize(17);
//         // doc.setFont("bold");
//         // // doc.text("PO#:", 430, 95);
//         // //POO number
//         // doc.text(`${productReceived.name}`, 460, 70);
//         // // doc.rect(460, 77, 90, 15);

//         // doc.setFontSize(22);
//         // // doc.setFont("times", "italic");
//         // doc.text("Company:", 40, 70);
//         // // doc.line(40, 68, 90, 68)
//         // doc.setFontSize(17);
//         // doc.text(`PBTI`, 138, 70);

//         // doc.setFontSize(12);
//         // doc.text("Address:", 40, 90);
//         // doc.setFontSize(9);
//         // doc.text("\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091", 90, 80);

//         // doc.setFontSize(12);
//         // doc.text("Phone:", 40, 140);
//         // doc.setFontSize(9);
//         // doc.text("8282822924", 80, 140);
//         // doc.setFontSize(12);
//         // doc.text("Website:", 40, 160);
//         // doc.setFontSize(9);
//         // doc.text("www.paapri.com", 90, 160);
//         // // doc.text("Website:", 40, 200);

//         // doc.setDrawColor(255, 0, 0);
//         // doc.setFillColor(230, 230, 230);
//         // doc.rect(40, 175, 200, 20, "F");
//         // doc.setFontSize(12);
//         // doc.setTextColor(0, 0, 0);
//         // doc.text("Receive From:", 45, 190);
//         // doc.setTextColor(0, 0, 0);
//         // // doc.text("Name:", 43, 210);
//         // doc.setFontSize(9);
//         // doc.text(vendor.name, 43, 220);
//         // // doc.text(`${productReceived.vendor.address}`, 43, 230);
//         // // doc.setDrawColor(255, 0, 0);
//         // // doc.setFillColor(230, 230, 230);
//         // // doc.rect(355, 175, 200, 20, "F");
//         // // doc.setFontSize(12);
//         // // doc.setTextColor(0, 0, 0);
//         // // doc.text("Ship To:", 360, 190);
//         // // doc.setTextColor(0, 0, 0);
//         // // doc.text("Name & Address:", 358, 210);
//         // doc.setFontSize(30);
//         // doc.setFont('Sans-serif');
//         // doc.setTextColor(0, 0, 0);
//         // doc.text("Product Receipt", 215, 28);
//         // let height = 200;

//         // doc.autoTable({

//         //     margin: { top: 280 },
//         //     styles: {
//         //         lineColor: [153, 153, 153],
//         //         lineWidth: 0.5,
//         //         fillColor: [179, 179, 179],

//         //     },
//         //     columnStyles: {
//         //         europe: { halign: 'center' },
//         //         0: { cellWidth: 88 },
//         //         2: { cellWidth: 40, halign: 'center' },
//         //         3: { cellWidth: 57, halign: 'right' },
//         //         4: { cellWidth: 65 },
//         //         5: { cellWidth: 65, halign: 'right' },
//         //     },
//         //     body: productReceived.products,
//         //     columns: [
//         //         { header: 'Product', dataKey: 'product' },
//         //         { header: 'Description', dataKey: 'description' },
//         //         { header: 'DemandQty', dataKey: 'demandQuantity', halign: 'center' },
//         //         { header: 'ReceivedQty', dataKey: 'receivedQuantity', halign: 'center' },
//         //         // { header: 'GST', dataKey: 'taxes' },
//         //         // { header: 'Sub Total', dataKey: 'subTotal' },
//         //     ],
//         //     didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
//         // })

//         // let h = height + 30;
//         // doc.setTextColor(0, 0, 0);
//         // doc.setFontSize(10);
//         // const pageCount = doc.internal.getNumberOfPages();

//         // doc.text(`${pageCount}`, 300, 820);

//         // doc.save(`Product Receipt - ${productReceived.name}.pdf`);
//       }
//     });
//   },

//   //BILL PDF
//   generateBillPDF(billId) {
//     ApiService.setHeader();
//     ApiService.get("bill/" + billId).then((response) => {
//       console.log(response);
//       if (response.data.isSuccess) {
//         const bill = response.data.document;

//         let Products = new Array();
//         var doc = new jsPDF("p", "pt", "a4");

//         doc.setDrawColor(0);
//         doc.setFillColor(255, 255, 255);
//         doc.rect(0, 0, 700, 40, "F");
//         doc.setFontSize(12);
//         doc.text("Date:", 440, 110);
//         doc.text(`${bill.billDate?.slice(0, 10)}`, 470, 110);
//         // doc.rect(460, 62, 90, 15);
//         doc.setFontSize(17);
//         doc.setFont("bold");

//         doc.text(`${bill.name}`, 440, 70);
//         // doc.rect(460, 77, 90, 15);

//         doc.setFontSize(22);
//         // doc.setFont("times", "italic");
//         doc.text("Company:", 40, 70);
//         // doc.line(40, 68, 90, 68)
//         doc.setFontSize(17);
//         doc.text(`PBTI`, 138, 70);

//         doc.setFontSize(12);
//         doc.text("Address:", 40, 90);
//         doc.setFontSize(9);
//         doc.text(
//           "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
//           90,
//           80
//         );

//         doc.setFontSize(12);
//         doc.text("Phone:", 40, 140);
//         doc.setFontSize(9);
//         doc.text("8282822924", 80, 140);
//         doc.setFontSize(12);
//         doc.text("Website:", 40, 160);
//         doc.setFontSize(9);
//         doc.text("www.paapri.com", 90, 160);

//         doc.setDrawColor(255, 0, 0);
//         doc.setFillColor(230, 230, 230);
//         doc.rect(40, 175, 200, 20, "F");
//         doc.setFontSize(12);
//         doc.setTextColor(0, 0, 0);
//         doc.text("Bill To:", 45, 190);
//         // doc.setTextColor(0, 0, 0);
//         // doc.text("Name:", 43, 210);
//         doc.setFontSize(9);
//         doc.text(`${bill.vendor.name}`, 43, 205);
//         // doc.text(`${bill.vendor.address}`, 43, 220);
//         // doc.setDrawColor(255, 0, 0);
//         // doc.setFillColor(230, 230, 230);
//         // doc.rect(355, 175, 200, 20, "F");
//         doc.setFontSize(12);
//         doc.setTextColor(0, 0, 0);
//         // doc.text("Source Document:", 360, 190);
//         doc.text(`${bill.sourceDocument.name}`, 440, 90);

//         // doc.setTextColor(0, 0, 0);
//         // doc.text("Name & Address:", 358, 210);
//         doc.setFontSize(30);
//         doc.setFont("Sans-serif");
//         doc.setTextColor(0, 0, 0);
//         doc.text("Bill", 260, 40);
//         let height = 200;

//         doc.autoTable({
//           margin: { top: 280 },
//           styles: {
//             lineColor: [153, 153, 153],
//             lineWidth: 0.5,
//             fillColor: [179, 179, 179],
//           },
//           columnStyles: {
//             europe: { halign: "center" },
//             0: { cellWidth: 88 },
//             2: { cellWidth: 80, halign: "center" },
//             3: { cellWidth: 50, halign: "right" },
//             4: { cellWidth: 65 },
//             5: { cellWidth: 65, halign: "right" },
//           },
//           body: bill.invoiceLines,
//           columns: [
//             { header: "Product", dataKey: "product" },
//             { header: "Label", dataKey: "label" },
//             { header: "Account", dataKey: "account", halign: "center" },
//             { header: "Quantity", dataKey: "quantity", halign: "center" },
//             { header: "Unit Price", dataKey: "unitPrice" },
//             { header: "Sub Total", dataKey: "subTotal" },
//             { header: "Taxes", dataKey: "taxes" },
//           ],
//           didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
//         });

//         let h = height + 30;

//         doc.setTextColor(0, 0, 0);
//         doc.setFontSize(10);
//         const pageCount = doc.internal.getNumberOfPages();

//         doc.text(`${pageCount}`, 300, 820);

//         doc.save(`Bill - ${bill.name}.pdf`);
//       }
//     });
//   },

//   //BILL PAYEMENT PDF
//   // generateBillPaymentPDF(billPaymentId) {
//   //     console.log(billPaymentId)
//   //     ApiService.setHeader();
//   //     ApiService.get('billPayment/' + billPaymentId).then(response => {
//   //         console.log(response);
//   //         if (response.data.isSuccess) {
//   //             const billPayment = response.data.document;

//   //             let Products = new Array();
//   //             var doc = new jsPDF('p', 'pt', 'a4');

//   //             doc.setDrawColor(0);
//   //             doc.setFillColor(255, 255, 255);
//   //             doc.rect(0, 0, 700, 40, "F");
//   //             doc.setFontSize(12);
//   //             doc.text("Date:", 430, 90);
//   //             doc.text(`${billPayment.date?.slice(0, 10)}`, 460, 90);
//   //             // doc.rect(460, 62, 90, 15);
//   //             doc.setFontSize(17);
//   //             doc.setFont("bold");
//   //             // doc.text("PO#:", 430, 95);
//   //             //POO number
//   //             doc.text(`${billPayment.name}`, 460, 70);
//   //             // doc.rect(460, 77, 90, 15);

//   //             doc.setFontSize(22);
//   //             // doc.setFont("times", "italic");
//   //             doc.text("Company:", 40, 70);
//   //             // doc.line(40, 68, 90, 68)
//   //             doc.setFontSize(17);
//   //             doc.text(`PBTI`, 138, 70);

//   //             doc.setFontSize(12);
//   //             doc.text("Address:", 40, 90);
//   //             doc.setFontSize(9);
//   //             doc.text("\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091", 90, 80);

//   //             doc.setFontSize(12);
//   //             doc.text("Phone:", 40, 140);
//   //             doc.setFontSize(9);
//   //             doc.text("8282822924", 80, 140);
//   //             doc.setFontSize(12);
//   //             doc.text("Website:", 40, 160);
//   //             doc.setFontSize(9);
//   //             doc.text("www.paapri.com", 90, 160);
//   //             // doc.text("Website:", 40, 200);

//   //             doc.setDrawColor(255, 0, 0);
//   //             doc.setFillColor(102, 194, 255);
//   //             doc.rect(40, 175, 200, 20, "F");
//   //             doc.setFontSize(12);
//   //             doc.setTextColor(0, 0, 0);
//   //             doc.text("Billed To:", 45, 190);
//   //             doc.setTextColor(0, 0, 0);
//   //             doc.text("Name & Address:", 43, 210);
//   //             doc.setFontSize(9);
//   //             doc.text(`${billPayment.vendor.name}`, 43, 220);
//   //             doc.text(`${billPayment.vendor.address}`, 43, 230);
//   //             // doc.setDrawColor(255, 0, 0);
//   //             // doc.setFillColor(102, 194, 255);
//   //             // doc.rect(355, 175, 200, 20, "F");
//   //             // doc.setFontSize(12);
//   //             // doc.setTextColor(0, 0, 0);
//   //             // doc.text("Ship To:", 360, 190);
//   //             // doc.setTextColor(0, 0, 0);
//   //             // doc.text("Name & Address:", 358, 210);
//   //             doc.setFontSize(30);
//   //             doc.setFont('Sans-serif');
//   //             doc.setTextColor(255, 255, 255);
//   //             doc.text("Print Bill", 220, 28);
//   //             let height = 200;

//   //             doc.autoTable({

//   //                 margin: { top: 280 },
//   //                 styles: {
//   //                     lineColor: [102, 194, 255],
//   //                     lineWidth: 0.5,
//   //                     fillColor: [102, 194, 255],

//   //                 },
//   //                 columnStyles: {
//   //                     europe: { halign: 'center' },
//   //                     0: { cellWidth: 88 },
//   //                     2: { cellWidth: 40, halign: 'center' },
//   //                     3: { cellWidth: 57, halign: 'right' },
//   //                     4: { cellWidth: 65 },
//   //                     5: { cellWidth: 65, halign: 'right' },
//   //                 },
//   //                 body: billPayment.products,
//   //                 columns: [
//   //                     { header: 'Journal Type', dataKey: 'journalType' },
//   //                     // { header: 'Cash', dataKey: 'cash' },
//   //                     { header: 'Amount', dataKey: 'amount', halign: 'center' },
//   //                     { header: 'Recipient Bank', dataKey: 'recipientBank', halign: 'center' },
//   //                     { header: 'Payment Date', dataKey: 'paymentDate', halign: 'center' },
//   //                     { header: 'Memo', dataKey: 'memo' },
//   //                     // { header: 'Sub Total', dataKey: 'subTotal' },
//   //                 ],
//   //                 didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
//   //             })

//   //             let h = height + 30;

//   //             doc.setTextColor(0, 0, 0);
//   //             doc.setFontSize(10);
//   //             const pageCount = doc.internal.getNumberOfPages();

//   //             doc.text(`${pageCount}`, 300, 820);
//   //             doc.save(`Bill Payment - ${billPayment.name}.pdf`);

//   //         }

//   //     })

//   // },

//   generatePurchaseOrderPDF(purchaseOrderId) {
//     console.log(purchaseOrderId);

//     ApiService.get("purchaseOrder/" + purchaseOrderId)
//       .then((response) => {
//         if (response.data.isSuccess) {
//           const purchaseOrder = response.data.document;
//           console.log(purchaseOrder.vendor);

//           // Get vendor name & address
//           ApiService.get("vendor/" + purchaseOrder.vendor)
//             .then((res) => {
//               if (res.data.isSuccess) {
//                 let products = new Array();
//                 var doc = new jsPDF("p", "pt", "a4");
//                 //header color
//                 doc.setDrawColor(0);
//                 doc.setFillColor(255, 255, 255);
//                 doc.rect(0, 0, 700, 40, "F");
//                 doc.setFontSize(12);
//                 doc.text("Date:", 460, 90);
//                 doc.text(`${purchaseOrder.date?.slice(0, 10)}`, 490, 90);
//                 // doc.rect(460, 62, 90, 15);
//                 doc.setFontSize(17);
//                 doc.setFont("bold");
//                 // doc.text("PO#:", 430, 95);
//                 //POO number
//                 doc.text(`${purchaseOrder.name}`, 460, 70);
//                 // doc.rect(460, 77, 90, 15);

//                 doc.setFontSize(22);
//                 // doc.setFont("times", "italic");
//                 doc.text("Company:", 40, 70);
//                 // doc.line(40, 68, 90, 68)
//                 doc.setFontSize(17);
//                 doc.text(`PBTI`, 138, 70);

//                 doc.setFontSize(12);
//                 doc.text("Address:", 40, 90);
//                 doc.setFontSize(9);
//                 doc.text(
//                   "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
//                   90,
//                   80
//                 );

//                 doc.setFontSize(12);
//                 doc.text("Phone:", 40, 140);
//                 doc.setFontSize(9);
//                 doc.text("8282822924", 80, 140);
//                 doc.setFontSize(12);
//                 doc.text("Website:", 40, 160);
//                 doc.setFontSize(9);
//                 doc.text("www.paapri.com", 90, 160);
//                 // doc.text("Website:", 40, 200);

//                 doc.setDrawColor(255, 0, 0);
//                 doc.setFillColor(230, 230, 230);
//                 doc.rect(40, 175, 200, 20, "F");
//                 doc.setFontSize(12);
//                 doc.setTextColor(0, 0, 0);
//                 doc.text("Vendor:", 45, 190);
//                 doc.setTextColor(0, 0, 0);
//                 doc.text("Name & Address:", 43, 210);
//                 doc.setFontSize(9);
//                 doc.text(`${res.data.document.name}`, 43, 220);
//                 doc.text(`${res.data.document.address}`, 43, 230);
//                 doc.setDrawColor(255, 0, 0);
//                 doc.setFillColor(230, 230, 230);
//                 doc.rect(355, 175, 200, 20, "F");
//                 doc.setFontSize(12);
//                 doc.setTextColor(0, 0, 0);
//                 doc.text("Ship To:", 360, 190);
//                 doc.setTextColor(0, 0, 0);
//                 doc.text("Name & Address:", 358, 210);
//                 doc.setFontSize(30);
//                 doc.setFont("Sans-serif");
//                 doc.setTextColor(0, 0, 0);
//                 doc.text("Purchase Order", 210, 40);
//                 let height = 200;

//                 // Create the table of products data
//                 doc.autoTable({
//                   margin: { top: 280 },
//                   styles: {
//                     lineColor: [153, 153, 153],
//                     lineWidth: 0.5,
//                     fillColor: [179, 179, 179],
//                   },
//                   columnStyles: {
//                     europe: { halign: "center" },
//                     0: { cellWidth: 88 },
//                     2: { cellWidth: 40, halign: "center" },
//                     3: { cellWidth: 57, halign: "right" },
//                     4: { cellWidth: 65 },
//                     5: { cellWidth: 65, halign: "right" },
//                   }, // European countries centered
//                   body: purchaseOrder.products,
//                   columns: [
//                     { header: "Product", dataKey: "product" },
//                     { header: "Description", dataKey: "description" },
//                     { header: "Qty", dataKey: "quantity", halign: "center" },
//                     {
//                       header: "UnitPrice",
//                       dataKey: "unitPrice",
//                       halign: "center",
//                     },
//                     { header: "GST", dataKey: "taxes" },
//                     { header: "Sub Total", dataKey: "subTotal" },
//                   ],
//                   didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
//                 });

//                 let h = height + 30;

//                 var formatter = new Intl.NumberFormat("en-in", {
//                   style: "currency",
//                   currency: "INR",
//                 });

//                 var currencyFormatted = formatter.format(
//                   purchaseOrder.estimation?.total
//                 );

//                 doc.setTextColor(0, 0, 0);
//                 doc.setFontSize(10);
//                 doc.text(`Total: ${currencyFormatted}`, 380, h);
//                 const pageCount = doc.internal.getNumberOfPages();

//                 doc.text(`${pageCount}`, 300, 820);
//                 doc.save(`Purchase Order - ${purchaseOrder.name}.pdf`);
//               } else {
//                 console.log(
//                   "Something went wrong while generating purchase order pdf"
//                 );
//               }
//             })
//             .catch((e) => {
//               console.log(e);
//             });
//         } else {
//           console.log(
//             "Something went wrong while generating purchase order pdf"
//           );
//         }
//       })
//       .catch((e) => {
//         console.log(e);
//       });
//   },
// };

// const SalesOrderPDF = {
//   generateSalesOrderPDF(salesOrderId) {
//     console.log(salesOrderId);
//     ApiService.setHeader();
//     ApiService.get("salesOrder/" + salesOrderId)
//       .then((response) => {
//         if (response.data.isSuccess) {
//           console.log(salesOrderId);
//           const salesOrder = response.data.document;
//           console.log(salesOrder);

//           let products = new Array();
//           var doc = new jsPDF("p", "pt", "a4");
//           //header color
//           doc.setDrawColor(0);
//           doc.setFillColor(255, 255, 255);
//           doc.rect(0, 0, 700, 40, "F");
//           doc.setFontSize(12);
//           doc.text("Date:", 430, 90);
//           doc.text(`${salesOrder.date?.slice(0, 10)}`, 460, 90);
//           doc.text("Delivery Date:", 380, 110);
//           doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
//           // doc.rect(460, 62, 90, 15);
//           doc.setFontSize(17);
//           doc.setFont("bold");
//           // doc.text("PO#:", 430, 95);
//           //POO number
//           doc.text(`${salesOrder.name}`, 460, 70);
//           // doc.rect(460, 77, 90, 15);

//           doc.setFontSize(22);
//           // doc.setFont("times", "italic");
//           doc.text("Company:", 40, 70);
//           // doc.line(40, 68, 90, 68)
//           doc.setFontSize(17);
//           doc.text(`PBTI`, 138, 70);

//           doc.setFontSize(12);
//           doc.text("Address:", 40, 90);
//           doc.setFontSize(9);
//           doc.text(
//             "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
//             90,
//             80
//           );

//           doc.setFontSize(12);
//           doc.text("Phone:", 40, 140);
//           doc.setFontSize(9);
//           doc.text("8282822924", 80, 140);
//           doc.setFontSize(12);
//           doc.text("Website:", 40, 160);
//           doc.setFontSize(9);
//           doc.text("www.paapri.com", 90, 160);
//           // doc.text("Website:", 40, 200);
//           doc.setDrawColor(255, 0, 0);
//           doc.setFillColor(230, 230, 230);
//           doc.rect(40, 175, 200, 20, "F");
//           doc.setFontSize(12);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Customer Name:", 45, 190);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Name & Address:", 43, 210);
//           doc.setFontSize(9);
//           doc.text(`${salesOrder.billingAddress}`, 43, 220);
//           // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
//           doc.setDrawColor(255, 0, 0);
//           doc.setFillColor(230, 230, 230);
//           doc.rect(355, 175, 200, 20, "F");
//           doc.setFontSize(12);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Ship To:", 360, 190);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Name & Address:", 358, 210);
//           doc.setFontSize(9);
//           doc.text(`${salesOrder.shippingAddress}`, 358, 220);
//           doc.setFontSize(30);
//           doc.setFont("Sans-serif");
//           doc.setTextColor(0, 0, 0);
//           doc.text("Sales Order", 215, 40);
//           let height = 200;

//           // Create the table of products data
//           doc.autoTable({
//             margin: { top: 280 },
//             styles: {
//               lineColor: [153, 153, 153],
//               lineWidth: 0.5,
//               fillColor: [179, 179, 179],
//             },
//             columnStyles: {
//               europe: { halign: "center" },
//               0: { cellWidth: 88 },
//               1: { cellWidth: 100, halign: "center" },
//               2: { cellWidth: 50, halign: "center" },
//               3: { cellWidth: 57, halign: "right" },
//               4: { cellWidth: 65 },
//               5: { cellWidth: 65, halign: "right" },

//               // 6: { cellWidth: 65, halign: 'right' },
//               // 7: { cellWidth: 65, halign: 'right' },
//             }, // European countries centered
//             body: salesOrder.products,
//             columns: [
//               { header: "Product", dataKey: "product" },
//               { header: "Description", dataKey: "description" },
//               { header: "Qty", dataKey: "quantity", halign: "center" },
//               { header: "Delivered", dataKey: "delivered" },
//               { header: "Invoiced", dataKey: "invoiced", halign: "center" },
//               { header: "Unit Rate", dataKey: "unitPrice", halign: "center" },
//               { header: "Taxes", dataKey: "taxes", halign: "center" },
//               {
//                 header: "Total",
//                 dataKey: "estimation.total",
//                 halign: "center",
//               },
//             ],
//             didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
//           });

//           let h = height + 30;

//           var formatter = new Intl.NumberFormat("en-in", {
//             style: "currency",
//             currency: "INR",
//           });

//           var currencyFormatted = formatter.format(salesOrder.estimation.total);

//           doc.setTextColor(0, 0, 0);
//           doc.setFontSize(10);
//           doc.text(`Total: ${currencyFormatted}`, 380, h);
//           const pageCount = doc.internal.getNumberOfPages();

//           doc.text(`${pageCount}`, 300, 820);
//           doc.save(`Sales Order - ${salesOrder.name}.pdf`);
//         } else {
//           console.log(
//             "Something went wrong while generating purchase order pdf"
//           );
//         }
//       })
//       .catch((e) => {
//         console.log(e);
//       });
//   },

//   generateInvoicePdDF(id) {
//     ApiService.setHeader();
//     ApiService.get("invoice/" + id)
//       .then((res) => {
//         if (res.data.isSuccess) {
//           const inv = res.data.document;
//           console.log(inv);

//           var doc = new jsPDF("p", "pt", "a4");
//           //header color
//           doc.setDrawColor(0);
//           doc.setFillColor(255, 255, 255);
//           doc.rect(0, 0, 700, 40, "F");
//           doc.setFontSize(12);
//           doc.text("Date:", 430, 90);
//           doc.text(`${inv.invoiceDate?.slice(0, 10)}`, 460, 90);
//           // doc.text("Delivery Date:", 380, 110);
//           // doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
//           // doc.rect(460, 62, 90, 15);
//           doc.setFontSize(13);
//           doc.setFont("bold");
//           // doc.text("PO#:", 430, 95);
//           //POO number
//           doc.text(`${inv.name}`, 400, 70);
//           // doc.rect(460, 77, 90, 15);

//           doc.setFontSize(22);
//           // doc.setFont("times", "italic");
//           doc.text("Company:", 40, 70);
//           // doc.line(40, 68, 90, 68)
//           doc.setFontSize(17);
//           doc.text(`PBTI`, 138, 70);

//           doc.setFontSize(12);
//           doc.text("Address:", 40, 90);
//           doc.setFontSize(9);
//           doc.text(
//             "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
//             90,
//             80
//           );

//           doc.setFontSize(12);
//           doc.text("Phone:", 40, 140);
//           doc.setFontSize(9);
//           doc.text("8282822924", 80, 140);
//           doc.setFontSize(12);
//           doc.text("Website:", 40, 160);
//           doc.setFontSize(9);
//           doc.text("www.paapri.com", 90, 160);
//           // doc.text("Website:", 40, 200);
//           doc.setDrawColor(255, 0, 0);
//           doc.setFillColor(230, 230, 230);
//           doc.rect(40, 175, 200, 20, "F");
//           doc.setFontSize(12);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Customer Name:", 45, 190);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Name & Address:", 43, 210);
//           doc.setFontSize(9);
//           // doc.text(`${salesOrder.billingAddress}`, 43, 220);
//           // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
//           doc.setDrawColor(255, 0, 0);
//           doc.setFillColor(230, 230, 230);
//           doc.rect(355, 175, 200, 20, "F");
//           doc.setFontSize(12);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Ship To:", 360, 190);
//           doc.setTextColor(0, 0, 0);
//           doc.text("Name & Address:", 358, 210);
//           doc.setFontSize(9);
//           // doc.text(`${salesOrder.shippingAddress}`, 358, 220);
//           doc.setFontSize(30);
//           doc.setFont("Sans-serif");
//           doc.setTextColor(0, 0, 0);
//           doc.text("Sales Order", 215, 40);
//           let height = 200;

//           let itemObjects = [];
//           // console.log(state);
//           inv.invoiceLines.map(async (item) => {
//             let newObject = new Object();
//             let itemData = await ApiService.get(`product/${item.product}`);

//             newObject.product = itemData.data.document.name;
//             newObject.label = item.label;
//             newObject.quantity = item.quantity;
//             newObject.unitPrice = item.unitPrice;
//             newObject.subTotal = item.subTotal;

//             // console.log(itemData.data.document.name);
//             // console.log(newObject);
//             itemObjects.push(newObject);
//           });

//           // Create the table of items data
//           doc.autoTable({
//             margin: { top: 220 },
//             styles: {
//               lineColor: [153, 153, 153],
//               lineWidth: 0.5,
//               fillColor: [179, 179, 179],
//             },
//             columnStyles: {
//               europe: { halign: "center" },
//               0: { cellWidth: 88 },
//               2: { cellWidth: 40 },
//               3: { cellWidth: 57 },
//               4: { cellWidth: 65 },
//             }, // European countries centered
//             body: inv.invoiceLines,
//             columns: [
//               { header: "Product", dataKey: "product" },
//               { header: "Label", dataKey: "label" },
//               { header: "Qty", dataKey: "quantity" },
//               { header: "UnitPrice", dataKey: "unitPrice" },
//               { header: "Sub Total", dataKey: "subTotal" },
//             ],
//             didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
//           });

//           let h = height + 30;

//           var formatter = new Intl.NumberFormat("en-in", {
//             style: "currency",
//             currency: "INR",
//           });

//           var currencyFormatted = formatter.format(inv.estimation.total);

//           doc.setTextColor(0, 0, 0);
//           doc.setFontSize(10);
//           doc.text(`Total: ${currencyFormatted}`, 380, h);
//           const pageCount = doc.internal.getNumberOfPages();

//           doc.text(`${pageCount}`, 300, 820);
//           doc.save(`INVOICE - ${inv.name}.pdf`);
//         } else {
//           console.log(
//             "Something went wrong while generating purchase order pdf"
//           );
//         }
//       })
//       .catch((e) => {
//         console.log(e);
//       });
//   },

//   generateDeliveryPDF(id) {
//     ApiService.setHeader();
//     ApiService.get("productDelivery/" + id).then((response) => {
//       console.log(response);
//       if (response.data.isSuccess) {
//         const bill = response.data.document;

//         let Products = new Array();
//         var doc = new jsPDF("p", "pt", "a4");

//         doc.setDrawColor(0);
//         doc.setFillColor(255, 255, 255);
//         doc.rect(0, 0, 700, 40, "F");
//         doc.setFontSize(12);
//         doc.text("Date:", 440, 110);
//         doc.text(`${bill.effectiveDate?.slice(0, 10)}`, 470, 110);
//         // doc.rect(460, 62, 90, 15);
//         doc.setFontSize(17);
//         doc.setFont("bold");

//         doc.text(`${bill.name}`, 440, 70);
//         // doc.rect(460, 77, 90, 15);

//         doc.setFontSize(22);
//         // doc.setFont("times", "italic");
//         doc.text("Company:", 40, 70);
//         // doc.line(40, 68, 90, 68)
//         doc.setFontSize(17);
//         doc.text(`PBTI`, 138, 70);

//         doc.setFontSize(12);
//         doc.text("Address:", 40, 90);
//         doc.setFontSize(9);
//         doc.text(
//           "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
//           90,
//           80
//         );

//         doc.setFontSize(12);
//         doc.text("Phone:", 40, 140);
//         doc.setFontSize(9);
//         doc.text("8282822924", 80, 140);
//         doc.setFontSize(12);
//         doc.text("Website:", 40, 160);
//         doc.setFontSize(9);
//         doc.text("www.paapri.com", 90, 160);

//         doc.setDrawColor(255, 0, 0);
//         doc.setFillColor(230, 230, 230);
//         doc.rect(40, 175, 200, 20, "F");
//         doc.setFontSize(12);
//         doc.setTextColor(0, 0, 0);
//         doc.text("Bill To:", 45, 190);
//         // doc.setTextColor(0, 0, 0);
//         // doc.text("Name:", 43, 210);
//         doc.setFontSize(9);
//         doc.text(`${bill.customer}`, 43, 205);
//         // doc.text(`${bill.vendor.address}`, 43, 220);
//         // doc.setDrawColor(255, 0, 0);
//         // doc.setFillColor(230, 230, 230);
//         // doc.rect(355, 175, 200, 20, "F");
//         doc.setFontSize(12);
//         doc.setTextColor(0, 0, 0);
//         // doc.text("Source Document:", 360, 190);
//         doc.text(`${bill.sourceDocument.name}`, 440, 90);

//         // doc.setTextColor(0, 0, 0);
//         // doc.text("Name & Address:", 358, 210);
//         doc.setFontSize(30);
//         doc.setFont("Sans-serif");
//         doc.setTextColor(0, 0, 0);
//         doc.text("Product Delivery", 230, 40);
//         let height = 200;

//         doc.autoTable({
//           margin: { top: 280 },
//           styles: {
//             lineColor: [153, 153, 153],
//             lineWidth: 0.5,
//             fillColor: [179, 179, 179],
//           },
//           columnStyles: {
//             europe: { halign: "center" },
//             0: { cellWidth: 88 },
//             2: { cellWidth: 80, halign: "center" },
//             3: { cellWidth: 50, halign: "right" },
//             4: { cellWidth: 65 },
//             5: { cellWidth: 65, halign: "right" },
//           },
//           body: bill.operations,
//           columns: [
//             { header: "Product", dataKey: "product" },
//             { header: "description", dataKey: "description" },
//             {
//               header: "demandQuantity",
//               dataKey: "demandQuantity",
//               halign: "center",
//             },
//             {
//               header: "doneQuantity",
//               dataKey: "doneQuantity",
//               halign: "center",
//             },
//           ],
//           didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
//         });

//         let h = height + 30;

//         doc.setTextColor(0, 0, 0);
//         doc.setFontSize(10);
//         const pageCount = doc.internal.getNumberOfPages();

//         doc.text(`${pageCount}`, 300, 820);

//         doc.save(`Product Delivery - ${bill.name}.pdf`);
//       }
//     });
//   },
// };

// export { PurchaseOrderPDF, SalesOrderPDF };
