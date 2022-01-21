import { React, useContext, useState, useEffect } from 'react';
import { BsTrash } from 'react-icons/bs';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import { PropagateLoader } from "react-spinners";
import { useHistory, useLocation, useParams } from 'react-router';
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { PurchaseOrderPDF } from '../../../helpers/PDF';
import { UserContext } from '../../../components/states/contexts/UserContext';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';


const schema = yup.object().shape({
    // vendor: yup.string().required("Please select vendor"),
    products: yup.array().of(
        yup.object().shape({
            // product: yup.string().required('Please select a product'),
            quantity: yup.number("Please enter a positive number").positive("Please enter a positive number").required('Please enter a positive number'),
            unitPrice: yup.number().typeError('you must specify a number').transform(value => (isNaN(value) ? console.log(value) : value)).positive("Please enter a positive number").required('Please enter a positive number'),
        })
    ),
}).required();



export default function PurchaseOrder() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [productReceiptCount, setProductReceiptCount] = useState(0);
    const [billedCount, setBilledCount] = useState(0)
    const { user } = useContext(UserContext)
    const [state, setstate] = useState({
        estimation: {
            untaxedAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0
        }
    });
    const [supplierList, setSupplierList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [productList, setProductList] = useState([])
    const [tabKey, setTabKey] = useState('products');
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;
    const useQuery = () => new URLSearchParams(useLocation().search);
    const mode = useQuery().get('mode');

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            purchaseRep: user.id,
            vendor: null,
            total: 0,
            billingStatus: 'Nothing to Bill',
            date: new Date().toISOString().split("T")[0],
            receiptDate: new Date().toISOString().split("T")[0]
        },
        resolver: yupResolver(schema),
    });


    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });

    const onSubmit = (formData) => { return isAddMode ? createDocument(formData) : updateDocument(id, formData); }

    let totalPurchasedQuantity = 0;
    let totalBilledQuantity = 0;
    let totalReceivedQuantity = 0;
    let totalReceived = 0;
    let totalBilled = 0;


    const createDocument = (data) => {
        // data.vendor = data.vendor[0].id
        console.log(data);
        ApiService.setHeader();
        return ApiService.post('/purchaseOrder/procedure', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/purchase/orders");
            }
        }).catch(e => {
            console.log(e);
            alert(e.message)
        })
    }

    const updateDocument = (id, data) => {
        if (state.billingStatus == "Fully Billed") {
            alert("you can't modify the document")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/purchaseOrder/procedure/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    history.push("/purchase/orders");
                }
            }).catch(e => {
                console.log(e);
            })
        }

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/purchaseOrder/delete/${id}`).then(response => {
            if (response.status == 204) {
                history.push("/purchase/orders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const handleReceiveProducts = () => {
        if (state.productReceipt) {
            history.push("/purchase/receiveproduct/" + state.productReceipt);
        } else {
            const products = getValues('products')
            console.log(products);

            const newProductReceipt = new Object();
            const operationNeedToProcess = new Array();
            products.map((product, index) => {
                if ((product.quantity - parseInt(product.received)) > 0) {
                    const operation = new Object();
                    operation.productIdentifier = product.productIdentifier;
                    operation.product = product.product[0].id;
                    operation.name = product.product[0].name;
                    operation.description = product.description;
                    operation.demandQuantity = parseInt(product.quantity) - parseInt(product.received);
                    operation.doneQuantity = 0;
                    operationNeedToProcess.push(operation)
                }
            });
            newProductReceipt.vendor = state.vendor[0].id;
            // newProductReceipt.notes = getValues('notes');
            newProductReceipt.backOrderOf = state.id;
            newProductReceipt.effectiveDate = new Date().toISOString().split("T")[0];
            newProductReceipt.sourceDocument = state.id;
            newProductReceipt.operations = operationNeedToProcess;

            ApiService.post('productReceipt/procedure', newProductReceipt).then(response => {

                history.push("/purchase/receiveproduct/" + response.data.document.id);
            })
        }

    }

    const openTransferedProduct = () => {
        history.push("/purchase/received/" + state.id);
    }

    const handleCreateBill = async () => {

        state?.products?.map(e => {
            totalReceived += parseInt(e.received)
            totalBilled += parseInt(e.billed)
        })
        if (totalReceived === totalBilled) {
            alert("Please received product first!!!")
        } else {
            const response = await ApiService.post('bill', { sourceDocument: state.id });
            if (response.data.isSuccess) {
                const PO = await ApiService.get('purchaseOrder/' + state.id);
                console.log(PO);
                PO.data.document?.products?.map(e => {
                    console.log(e);
                    totalPurchasedQuantity += parseInt(e.quantity);
                    totalBilledQuantity += parseInt(e.billed);
                    totalReceivedQuantity += parseInt(e.received);
                })
                console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                console.log("totalReceivedQuantity: ", totalReceivedQuantity);
                console.log("totalBilledQuantity: ", totalBilledQuantity);

                if (totalPurchasedQuantity === totalBilledQuantity) {
                    // console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                    // console.log("totalBilledQuantity: ", totalBilledQuantity);
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Fully Billed' }).then(async res => {
                        if (res.data.isSuccess) {
                            await ApiService.patch('purchaseOrder/increaseProductqty/' + res.data.document._id, res.data.document).then(r => {
                                if (r.data.isSuccess) {
                                    // history.push("/purchase/bill/" + response.data.document.id);
                                    history.push("/purchase/bills");
                                }
                            })
                        }
                    })
                } else if (totalPurchasedQuantity === totalReceivedQuantity) {
                    // console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                    // console.log("totalReceivedQuantity: ", totalReceivedQuantity);
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Fully Received / Partially billed' })
                } else {
                    // console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                    // console.log("totalReceivedQuantity: ", totalReceivedQuantity);
                    // console.log("totalBilledQuantity: ", totalBilledQuantity);
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Partially Received / Billed' })
                }

                // await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
                history.push("/purchase/bill/" + response.data.document.id);
            }
        }

    }

    const handleVendorBill = async () => {
        history.push("/purchase/billed/" + state.id);
    }

    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generatePurchaseOrderPDF(state.id);
        return;
    }

    const updateOrderLines = (index) => {
        let cumulativeSum = 0, cgstSum = 0, sgstSum = 0, igstSum = 0;
        const products = getValues('products')
        products?.map((val) => {
            console.log(val.product);
            if (val.taxes !== 0 && val.subTotal) {
                cumulativeSum += parseFloat(val.subTotal);
                cgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
                sgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
                igstSum += parseFloat(((val.taxes) * val.subTotal) / 100);
            }
        });

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            cgst: cgstSum,
            sgst: sgstSum,
            igst: igstSum,
            total: parseFloat(cumulativeSum + igstSum)
        });
        setstate(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: cumulativeSum,
                cgst: cgstSum,
                sgst: sgstSum,
                igst: igstSum,
                total: parseFloat(cumulativeSum + igstSum)
            }
        }));

    }

    if (isAddMode) {
        setValue('purchaseRep', user.id);
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log(getValues('products').length)
        updateOrderLines()

        const supplierResponse = await ApiService.get('vendor');
        if (supplierResponse.data.isSuccess) {
            setSupplierList(supplierResponse.data.documents)
        }

        const employeeResponse = await ApiService.get('employee');
        if (employeeResponse.data.isSuccess) {
            setEmployeeList(employeeResponse.data.documents)
        }

        const productResponse = await ApiService.get('product');
        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
        }

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }
        if (!isAddMode) {

            ApiService.setHeader();
            const productReceiptResponse = await ApiService.get('productReceipt/searchByPO/' + id);
            if (productReceiptResponse.data.isSuccess) {
                setProductReceiptCount(productReceiptResponse.data.results)
            }

            const billResponse = await ApiService.get('bill/searchByPO/' + id);
            if (billResponse.data.isSuccess) {
                setBilledCount(billResponse.data.results)
            }

            ApiService.get(`purchaseOrder/${id}`).then(response => {
                const purchaseOrder = response.data.document;
                console.log(purchaseOrder);
                setstate(purchaseOrder)
                reset(purchaseOrder);
                if (purchaseOrder.date) {
                    setValue('date', purchaseOrder.date.split("T")[0]);
                    setValue('receiptDate', purchaseOrder.receiptDate.split("T")[0]);
                }
                setLoderStatus("SUCCESS");

            }).catch(e => {
                console.log(e)
            })
        }

    }, []);


    console.log(billedCount);
    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col>
                            <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                            </Breadcrumb>

                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {mode === "view" ? <Button as={Link} to={`/purchase/order/${id}?mode=edit`} variant="primary" size="sm">Edit</Button> : productReceiptCount > 0 || state.status === "Fully Billed" ? " " : <Button type="submit" variant="primary" size="sm">SAVE</Button>}

                            <Button as={Link} to="/purchase/orders" variant="light" size="sm">DISCARD</Button>
                            {billedCount > 0 ? "" : <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>

                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mb-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && !state.isFullyReceived ? <Button variant="primary" onClick={handleReceiveProducts}>RECEIVE PRODUCTS</Button> : ""}
                                {!isAddMode && state.billingStatus !== "Fully Billed" ? <Button onClick={handleCreateBill} variant="primary">CREATE BILL</Button> : ""}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">LOCK</Button> */}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && billedCount > 0 ? <Button size="sm" onClick={handleVendorBill} varient="primary">{billedCount} Vendor Bills</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && productReceiptCount > 0 ? <Button size="sm" onClick={openTransferedProduct} varient="primary">{productReceiptCount} Receipt</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.billingStatus}</div>}
                            </div>
                        </Col>
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Purchase Order</Form.Label>
                                {mode === "view" ? <Form.Control
                                    plaintext readOnly disabled
                                    type="text"
                                    id="name"
                                    name="name"
                                    disabled={true}
                                    {...register("name")} /> : <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    disabled={true}
                                    {...register("name")} />}
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Vendor</Form.Label>
                                {mode === "view" ? <Form.Control className="record-view-list" as="select" id="vendor" name="vendor" {...register("vendor", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {supplierList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Control> : <Controller
                                    name="vendor"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                    (
                                        <Typeahead
                                            id="vendor"
                                            // labelKey="name"
                                            labelKey='name'
                                            // multiple
                                            onChange={onChange}
                                            options={supplierList}
                                            placeholder="Choose a vendor..."
                                            selected={value}
                                        />
                                    )
                                    }
                                />}
                                {errors.vendor?.message && <p style={{ color: "red" }}>{errors.vendor?.message}</p>}
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Purchase Representative</Form.Label>
                                {mode === "view" ? <Form.Control className="record-view-list" as="select" id="purchaseRep" name="purchaseRep" {...register("purchaseRep", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {employeeList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Control> : <Form.Select disabled={!isAddMode ? true : false} id="purchaseRep" name="purchaseRep" {...register("purchaseRep", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {employeeList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>}
                            </Form.Group>

                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Date</Form.Label>
                                {mode === "view" ? <Form.Control
                                    plaintext readOnly disabled
                                    type="date"
                                    id="date"
                                    name="date"
                                    {...register("date")} /> : <Form.Control
                                    disabled={!isAddMode ? true : false}
                                    type="date"
                                    id="date"
                                    name="date"
                                    {...register("date")} />}
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Receipt Date</Form.Label>
                                {mode === "view" ? <Form.Control
                                    plaintext readOnly disabled
                                    type="date"
                                    id="receiptDate"
                                    name="receiptDate"
                                    {...register("receiptDate")} /> : <Form.Control
                                    type="date"
                                    id="receiptDate"
                                    name="receiptDate"
                                    {...register("receiptDate")} />}
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Remark</Form.Label>
                                {mode === "view" ? <Form.Control
                                    plaintext readOnly disabled
                                    as="textarea"
                                    id="remark"
                                    name="remark"
                                    {...register("remark")}
                                /> : <Form.Control
                                    as="textarea"
                                    id="remark"
                                    name="remark"
                                    {...register("remark")}
                                />}
                            </Form.Group>
                        </Row>



                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="products" title="Products">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "2rem" }}>#</th>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Received</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Billed</th>}
                                                    <th style={{ minWidth: "16rem" }}>Unit Rate</th>
                                                    <th style={{ minWidth: "16rem" }}>Taxes (%)</th>
                                                    <th style={{ minWidth: "16rem" }}>Amount</th>
                                                    {mode !== "view" && <th></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <Form.Group>
                                                                {mode === "view" ? <Form.Control
                                                                    className="record-view-list"
                                                                    as="select"
                                                                    id="product"
                                                                    name="product"
                                                                    {...register(`products.${index}.product`)}>
                                                                    <option value={null}></option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Control> :
                                                                    <Controller
                                                                        name={`products.${index}.product`}
                                                                        control={control}
                                                                        defaultValue=""
                                                                        render={({ field: { onChange, value }, fieldState: { error } }) =>

                                                                        (
                                                                            <Typeahead
                                                                                id="product"
                                                                                // labelKey="name"
                                                                                labelKey='name'

                                                                                onChange={onChange}
                                                                                onBlur={(e) => {

                                                                                    console.log(value);
                                                                                    console.log(e);
                                                                                    // const product = await ApiService.get('product/' + e.target.value);
                                                                                    // console.log(product);
                                                                                    setValue(`products.${index}.account`, value[0]?.assetAccount);
                                                                                    setValue(`products.${index}.quantity`, 1);
                                                                                    setValue(`products.${index}.product[0].id`, value[0]?.id);
                                                                                    setValue(`products.${index}.product[0].name`, value[0]?.name);
                                                                                    setValue(`products.${index}.description`, value[0]?.description);
                                                                                    setValue(`products.${index}.unitPrice`, value[0]?.cost);
                                                                                    setValue(`products.${index}.taxes`, value[0]?.igstRate);
                                                                                    setValue(`products.${index}.cgstRate`, value[0]?.cgstRate);
                                                                                    setValue(`products.${index}.sgstRate`, value[0]?.sgstRate);
                                                                                    setValue(`products.${index}.igstRate`, value[0]?.igstRate);

                                                                                    const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                                    setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                                    // const val = getValues('products');
                                                                                    // console.log(val);
                                                                                    // let i = 0;
                                                                                    // val?.map(ele => {
                                                                                    //     console.log(ele.product);
                                                                                    //     if (ele.product == e[0]?.id) {
                                                                                    //         console.log(parseInt(ele.quantity) + 1);
                                                                                    //         let qty = parseInt(ele.quantity) + 1
                                                                                    //         console.log(parseFloat(parseFloat(values[0]) * parseInt(qty)));
                                                                                    //         setValue(`products.${i}.quantity`, qty);

                                                                                    //         setValue(`products.${i}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(qty)).toFixed(2));
                                                                                    //         itemRemove(index)
                                                                                    //     }
                                                                                    //     i++;
                                                                                    // })

                                                                                    updateOrderLines(index)

                                                                                }}
                                                                                options={productList}
                                                                                placeholder="Choose a product..."
                                                                                selected={value}
                                                                            />
                                                                        )
                                                                        }
                                                                    />
                                                                    // <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}
                                                                    //     onChange={async (e) => {
                                                                    //         const product = await ApiService.get('product/' + e.target.value);
                                                                    //         setValue(`products.${index}.account`, product.data.document.assetAccount);
                                                                    //         setValue(`products.${index}.quantity`, 1);
                                                                    //         setValue(`products.${index}.name`, product.data.document.name);
                                                                    //         setValue(`products.${index}.description`, product.data.document.description);
                                                                    //         setValue(`products.${index}.unitPrice`, product.data.document.cost);
                                                                    //         setValue(`products.${index}.taxes`, product.data.document.igstRate);
                                                                    //         setValue(`products.${index}.cgstRate`, product.data.document.cgstRate);
                                                                    //         setValue(`products.${index}.sgstRate`, product.data.document.sgstRate);
                                                                    //         setValue(`products.${index}.igstRate`, product.data.document.igstRate);

                                                                    //         const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                    //         setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                    //         const val = getValues('products');
                                                                    //         let i = 0;
                                                                    //         val?.map(ele => {
                                                                    //             // console.log(typeof e.target.value);
                                                                    //             if (ele.product == e.target.value) {
                                                                    //                 console.log(parseInt(ele.quantity) + 1);
                                                                    //                 let qty = parseInt(ele.quantity) + 1
                                                                    //                 console.log(parseFloat(parseFloat(values[0]) * parseInt(qty)));
                                                                    //                 setValue(`products.${i}.quantity`, qty);

                                                                    //                 setValue(`products.${i}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(qty)).toFixed(2));
                                                                    //                 itemRemove(index)
                                                                    //             }
                                                                    //             i++;
                                                                    //         })

                                                                    //         updateOrderLines(index)

                                                                    //     }}>
                                                                    //     <option value={null}></option>
                                                                    //     {productList.map(element => {
                                                                    //         return <option value={element.id}>{element.name}</option>
                                                                    //     })}
                                                                    // </Form.Select>
                                                                }
                                                                {errors?.['products']?.[index]?.['product']?.['message'] && <p style={{ color: "red" }}>{errors?.['products']?.[index]?.['product']?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === "view" ? <Form.Control
                                                                    plaintext readOnly disabled
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`products.${index}.description`)} /> : <Form.Control
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`products.${index}.description`)} />}
                                                            </Form.Group>
                                                        </td>
                                                        <td>

                                                            <Form.Group >

                                                                {mode === "view" ? <Form.Control
                                                                    plaintext
                                                                    readOnly
                                                                    disabled
                                                                    type="text"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`products.${index}.quantity`)} /> : <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    disabled={productReceiptCount > 0 ? true : false}
                                                                    {...register(`products.${index}.quantity`)}
                                                                    onBlur={(e) => {
                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                        updateOrderLines(index)
                                                                    }}
                                                                />}
                                                                {errors?.['products']?.[index]?.['quantity']?.['message'] && <p style={{ color: "red" }}>{errors?.['products']?.[index]?.['quantity']?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>
                                                        {!isAddMode && <td>
                                                            <Form.Group >
                                                                {mode === "view" ? <Form.Control plaintext readOnly disabled
                                                                    type="number"
                                                                    id="received"
                                                                    name="received"
                                                                    {...register(`products.${index}.received`)} /> : <Form.Control disabled
                                                                        type="number"
                                                                        id="received"
                                                                        name="received"
                                                                        {...register(`products.${index}.received`)} />}
                                                            </Form.Group>
                                                        </td>}
                                                        {!isAddMode && <td>
                                                            <Form.Group >
                                                                {mode === "view" ? <Form.Control plaintext readOnly disabled
                                                                    type="text"
                                                                    id="billed"
                                                                    name="billed"
                                                                    {...register(`products.${index}.billed`)} /> : <Form.Control disabled
                                                                        type="text"
                                                                        id="billed"
                                                                        name="billed"
                                                                        {...register(`products.${index}.billed`)} />}
                                                            </Form.Group>
                                                        </td>}

                                                        <td>
                                                            <Form.Group>
                                                                {mode === "view" ? <Form.Control
                                                                    plaintext readOnly disabled
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`products.${index}.unitPrice`)}></Form.Control> : <Form.Control
                                                                        disabled={!isAddMode ? true : false}
                                                                        step="0.001"
                                                                        type="number"
                                                                        id="unitPrice"
                                                                        name="unitPrice"
                                                                        {...register(`products.${index}.unitPrice`)}
                                                                        onBlur={() => {
                                                                            const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                            setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                            updateOrderLines(index)
                                                                        }}
                                                                    >

                                                                </Form.Control>}
                                                                {errors?.['products']?.[index]?.['unitPrice']?.['message'] && <p style={{ color: "red" }}>{errors?.['products']?.[index]?.['unitPrice']?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === "view" ? <Form.Control plaintext readOnly disabled
                                                                    type="number"
                                                                    id="taxes"
                                                                    name="taxes"
                                                                    {...register(`products.${index}.taxes`)} /> : <Form.Control disabled
                                                                        type="number"
                                                                        id="taxes"
                                                                        name="taxes"
                                                                        {...register(`products.${index}.taxes`)} />}
                                                            </Form.Group>
                                                        </td>


                                                        <td>
                                                            <Form.Group >
                                                                {mode === "view" ? <Form.Control plaintext readOnly disabled
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`products.${index}.subTotal`)} /> : <Form.Control disabled
                                                                        step="0.001"
                                                                        type="number"
                                                                        id="subTotal"
                                                                        name="subTotal"
                                                                        {...register(`products.${index}.subTotal`)} />}
                                                            </Form.Group>
                                                        </td>
                                                        {mode !== "view" && state.billingStatus !== "Fully Billed" && <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    itemRemove(index)
                                                                    updateOrderLines(index)
                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>}
                                                    </tr>
                                                    )
                                                })}
                                                {mode !== "view" && state.billingStatus !== "Fully Billed" && <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ product: null, description: '', quantity: 1, received: 0, billed: 0, taxes: 0, unitPrice: 0, subTotal: 0 })} >Add a product</Button>
                                                    </td>
                                                </tr>}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>

                        </Tabs>
                    </Container>
                    <Container className="mt-4 mb-4" fluid>
                        <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            <Col sm="12" md="4">
                                <Card>
                                    {/* <Card.Header as="h5">Featured</Card.Header> */}
                                    <Card.Body>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>Sub Total:</Col>
                                            <Col>{formatNumber(state.estimation?.untaxedAmount)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>CGST:</Col>
                                            <Col>{formatNumber(state.estimation?.cgst)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>SGST:</Col>
                                            <Col>{formatNumber(state.estimation?.sgst)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state.estimation?.total)}</Col>
                                        </Row>


                                    </Card.Body>
                                </Card>

                            </Col>
                        </Row>

                    </Container>
                </Container>




            </Form>
        </Container>
    )
}







// function tagRender(props) {
//     const colours = [{ value: 'gold' }, { value: 'lime' }, { value: 'green' }, { value: 'cyan' }];
//     const random = Math.floor(Math.random() * colours.length);

//     const { label, value, closable, onClose } = props;
//     const onPreventMouseDown = event => {
//         event.preventDefault();
//         event.stopPropagation();
//     };
//     return (
//         <Tag
//             color={colours[random].value}
//             onMouseDown={onPreventMouseDown}
//             closable={closable}
//             onClose={onClose}
//             style={{ marginRight: 3 }}>
//             {label}
//         </Tag>
//     );
// }
