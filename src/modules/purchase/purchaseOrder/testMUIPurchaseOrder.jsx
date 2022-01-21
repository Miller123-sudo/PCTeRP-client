import { React, useContext, useState, useEffect } from 'react';
import { BsTrash } from 'react-icons/bs';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { TextField, Grid, MenuItem, FormControlLabel, Checkbox } from '@material-ui/core';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Autocomplete } from '@material-ui/lab';
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Link } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { useHistory, useLocation, useParams } from 'react-router';
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { PurchaseOrderPDF } from '../../../helpers/PDF';
import { UserContext } from '../../../components/states/contexts/UserContext';
// import 'react-bootstrap-typeahead/css/Typeahead.css';



export default function PurchaseOrder() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [singleSelections, setSingleSelections] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);
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
        }
    });


    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });

    const onSubmit = (formData) => { return isAddMode ? createDocument(formData) : updateDocument(id, formData); }

    let totalPurchasedQuantity = 0;
    let totalBilledQuantity = 0;
    let totalReceivedQuantity = 0;
    let totalReceived = 0;
    let totalBilled = 0;

    console.log(user);
    const createDocument = (data) => {
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
        history.push("/purchase/receiveproduct/" + state.productReceipt);
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
        products.map((val) => {
            cumulativeSum += parseFloat(val.subTotal);
            cgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
            sgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
            igstSum += parseFloat(((val.taxes) * val.subTotal) / 100);
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
        updateOrderLines();

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
                setstate(purchaseOrder)
                reset(purchaseOrder);
                if (purchaseOrder.date) {
                    setValue('date', purchaseOrder.date.split("T")[0]);
                    setValue('receiptDate', purchaseOrder.receiptDate.split("T")[0]);
                }
                console.log(purchaseOrder.testsupplier);
                // setSingleSelections(purchaseOrder.testsupplier)
                setLoderStatus("SUCCESS");

            }).catch(e => {
                console.log(e)
            })
        }

    }, []);

    const getOpObj = option => {
        if (!option._id) option = options.find(op => op._id === option);
        return option;
    };
    console.log(supplierList);


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
                                <Controller

                                    name="name"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            // label="Purchase Order"
                                            variant="standard"
                                            value={value}
                                            onChange={onChange}
                                            style={{ width: 540 }}
                                        // error={!!error}
                                        // helperText={error ? error.message : null}
                                        />
                                    )}
                                // rules={{ required: 'First name required' }}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Vendor</Form.Label>
                                <Controller
                                    name="vendor"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            id=""
                                            select
                                            // label="Select"
                                            value={value}
                                            onChange={onChange}
                                            variant="standard"
                                            style={{ width: 540 }}
                                        >
                                            {supplierList?.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}

                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className=" record-view-label m-0">Purchase Representative</Form.Label>
                                <Controller
                                    name="purchaseRep"
                                    control={control}
                                    defaultValue={user.id}
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            id=""
                                            select
                                            // label="Select"
                                            value={value}
                                            onChange={onChange}
                                            variant="standard"
                                            style={{ width: 540 }}
                                        >
                                            {employeeList?.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}

                                />
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
                                <Controller
                                    name="remark"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>
                                    (
                                        <TextField
                                            onChange={onChange}
                                            value={value}
                                            variant="standard"
                                            multiline
                                            variant="outlined"
                                            style={{ width: 540 }}
                                        />
                                    )
                                    }
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group>
                                <Controller
                                    name="isTrue"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>
                                    (
                                        <FormControlLabel control={
                                            <Checkbox
                                                value={value}
                                                onChange={onChange}
                                            />}
                                            label="yes" />
                                    )
                                    }
                                />
                            </Form.Group>
                            <Form.Group>

                                <Controller
                                    name="testsupplier"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>
                                    (
                                        <Typeahead
                                            id="basic-typeahead-single"
                                            labelKey="name"
                                            // multiple
                                            onChange={onChange}
                                            // onChange={setSingleSelections}
                                            // onBlur={() => {
                                            //     setValue("testsupplier", singleSelections)
                                            //     console.log(singleSelections)
                                            // }}
                                            options={supplierList}
                                            // placeholder="Choose a state..."
                                            selected={value}
                                        />
                                    )
                                    }
                                />

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
                                                                </Form.Control> : <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}
                                                                    onChange={async (e) => {
                                                                        const product = await ApiService.get('product/' + e.target.value);
                                                                        setValue(`products.${index}.account`, product.data.document.assetAccount);
                                                                        setValue(`products.${index}.quantity`, 1);
                                                                        setValue(`products.${index}.name`, product.data.document.name);
                                                                        setValue(`products.${index}.description`, product.data.document.description);
                                                                        setValue(`products.${index}.unitPrice`, product.data.document.cost);
                                                                        setValue(`products.${index}.taxes`, product.data.document.igstRate);
                                                                        setValue(`products.${index}.cgstRate`, product.data.document.cgstRate);
                                                                        setValue(`products.${index}.sgstRate`, product.data.document.sgstRate);
                                                                        setValue(`products.${index}.igstRate`, product.data.document.igstRate);

                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                        const val = getValues('products');
                                                                        let i = 0;
                                                                        val?.map(ele => {
                                                                            // console.log(typeof e.target.value);
                                                                            if (ele.product == e.target.value) {
                                                                                console.log(parseInt(ele.quantity) + 1);
                                                                                let qty = parseInt(ele.quantity) + 1
                                                                                console.log(parseFloat(parseFloat(values[0]) * parseInt(qty)));
                                                                                setValue(`products.${i}.quantity`, qty);

                                                                                setValue(`products.${i}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(qty)).toFixed(2));
                                                                                itemRemove(index)
                                                                            }
                                                                            i++;
                                                                        })

                                                                        updateOrderLines(index)

                                                                    }}>
                                                                    <option value={null}></option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>}

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




            </Form >
        </Container >
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

function countryToFlag(isoCode) {
    return typeof String.fromCodePoint !== "undefined"
        ? isoCode
            .toUpperCase()
            .replace(/./g, char =>
                String.fromCodePoint(char.charCodeAt(0) + 127397)
            )
        : isoCode;
}

const countries = [
    { code: "AD", label: "Andorra", phone: "376" },
    { code: "AE", label: "United Arab Emirates", phone: "971" },
    { code: "AF", label: "Afghanistan", phone: "93" },
    { code: "AG", label: "Antigua and Barbuda", phone: "1-268" },
    { code: "AI", label: "Anguilla", phone: "1-264" },
    { code: "AL", label: "Albania", phone: "355" },
    { code: "AM", label: "Armenia", phone: "374" },
    { code: "AO", label: "Angola", phone: "244" },
    { code: "AQ", label: "Antarctica", phone: "672" },
    { code: "AR", label: "Argentina", phone: "54" },
    { code: "AS", label: "American Samoa", phone: "1-684" },
    { code: "AT", label: "Austria", phone: "43" },
    { code: "AU", label: "Australia", phone: "61", suggested: true },
    { code: "AW", label: "Aruba", phone: "297" },
    { code: "AX", label: "Alland Islands", phone: "358" },
    { code: "AZ", label: "Azerbaijan", phone: "994" },
    { code: "BA", label: "Bosnia and Herzegovina", phone: "387" },
    { code: "BB", label: "Barbados", phone: "1-246" },
    { code: "BD", label: "Bangladesh", phone: "880" },
    { code: "BE", label: "Belgium", phone: "32" },
    { code: "BF", label: "Burkina Faso", phone: "226" },
    { code: "BG", label: "Bulgaria", phone: "359" },
    { code: "BH", label: "Bahrain", phone: "973" },
    { code: "BI", label: "Burundi", phone: "257" },
    { code: "BJ", label: "Benin", phone: "229" },
    { code: "BL", label: "Saint Barthelemy", phone: "590" },
    { code: "BM", label: "Bermuda", phone: "1-441" },
    { code: "BN", label: "Brunei Darussalam", phone: "673" },
    { code: "BO", label: "Bolivia", phone: "591" },
    { code: "BR", label: "Brazil", phone: "55" },
    { code: "BS", label: "Bahamas", phone: "1-242" },
    { code: "BT", label: "Bhutan", phone: "975" },
    { code: "BV", label: "Bouvet Island", phone: "47" },
    { code: "BW", label: "Botswana", phone: "267" },
    { code: "BY", label: "Belarus", phone: "375" },
    { code: "BZ", label: "Belize", phone: "501" },
    { code: "CA", label: "Canada", phone: "1", suggested: true },
    { code: "CC", label: "Cocos (Keeling) Islands", phone: "61" },
    { code: "CD", label: "Congo, Republic of the", phone: "242" },
    { code: "CF", label: "Central African Republic", phone: "236" },
    { code: "CG", label: "Congo, Democratic Republic of the", phone: "243" },
    { code: "CH", label: "Switzerland", phone: "41" },
    { code: "CI", label: "Cote d'Ivoire", phone: "225" },
    { code: "CK", label: "Cook Islands", phone: "682" },
    { code: "CL", label: "Chile", phone: "56" },
    { code: "CM", label: "Cameroon", phone: "237" },
    { code: "CN", label: "China", phone: "86" },
    { code: "CO", label: "Colombia", phone: "57" },
    { code: "CR", label: "Costa Rica", phone: "506" },
    { code: "CU", label: "Cuba", phone: "53" },
    { code: "CV", label: "Cape Verde", phone: "238" },
    { code: "CW", label: "Curacao", phone: "599" },
    { code: "CX", label: "Christmas Island", phone: "61" },
    { code: "CY", label: "Cyprus", phone: "357" },
    { code: "CZ", label: "Czech Republic", phone: "420" },
    { code: "DE", label: "Germany", phone: "49", suggested: true },
    { code: "DJ", label: "Djibouti", phone: "253" },
    { code: "DK", label: "Denmark", phone: "45" },
    { code: "DM", label: "Dominica", phone: "1-767" },
    { code: "DO", label: "Dominican Republic", phone: "1-809" },
    { code: "DZ", label: "Algeria", phone: "213" },
    { code: "EC", label: "Ecuador", phone: "593" },
    { code: "EE", label: "Estonia", phone: "372" },
    { code: "EG", label: "Egypt", phone: "20" },
    { code: "EH", label: "Western Sahara", phone: "212" },
    { code: "ER", label: "Eritrea", phone: "291" },
    { code: "ES", label: "Spain", phone: "34" },
    { code: "ET", label: "Ethiopia", phone: "251" },
    { code: "FI", label: "Finland", phone: "358" },
    { code: "FJ", label: "Fiji", phone: "679" },
    { code: "FK", label: "Falkland Islands (Malvinas)", phone: "500" },
    { code: "FM", label: "Micronesia, Federated States of", phone: "691" },
    { code: "FO", label: "Faroe Islands", phone: "298" },
    { code: "FR", label: "France", phone: "33", suggested: true },
    { code: "GA", label: "Gabon", phone: "241" },
    { code: "GB", label: "United Kingdom", phone: "44" },
    { code: "GD", label: "Grenada", phone: "1-473" },
    { code: "GE", label: "Georgia", phone: "995" },
    { code: "GF", label: "French Guiana", phone: "594" },
    { code: "GG", label: "Guernsey", phone: "44" },
    { code: "GH", label: "Ghana", phone: "233" },
    { code: "GI", label: "Gibraltar", phone: "350" },
    { code: "GL", label: "Greenland", phone: "299" },
    { code: "GM", label: "Gambia", phone: "220" },
    { code: "GN", label: "Guinea", phone: "224" },
    { code: "GP", label: "Guadeloupe", phone: "590" },
    { code: "GQ", label: "Equatorial Guinea", phone: "240" },
    { code: "GR", label: "Greece", phone: "30" },
    {
        code: "GS",
        label: "South Georgia and the South Sandwich Islands",
        phone: "500"
    },
    { code: "GT", label: "Guatemala", phone: "502" },
    { code: "GU", label: "Guam", phone: "1-671" },
    { code: "GW", label: "Guinea-Bissau", phone: "245" },
    { code: "GY", label: "Guyana", phone: "592" },
    { code: "HK", label: "Hong Kong", phone: "852" },
    { code: "HM", label: "Heard Island and McDonald Islands", phone: "672" },
    { code: "HN", label: "Honduras", phone: "504" },
    { code: "HR", label: "Croatia", phone: "385" },
    { code: "HT", label: "Haiti", phone: "509" },
    { code: "HU", label: "Hungary", phone: "36" },
    { code: "ID", label: "Indonesia", phone: "62" },
    { code: "IE", label: "Ireland", phone: "353" },
    { code: "IL", label: "Israel", phone: "972" },
    { code: "IM", label: "Isle of Man", phone: "44" },
    { code: "IN", label: "India", phone: "91" },
    { code: "IO", label: "British Indian Ocean Territory", phone: "246" },
    { code: "IQ", label: "Iraq", phone: "964" },
    { code: "IR", label: "Iran, Islamic Republic of", phone: "98" },
    { code: "IS", label: "Iceland", phone: "354" },
    { code: "IT", label: "Italy", phone: "39" },
    { code: "JE", label: "Jersey", phone: "44" },
    { code: "JM", label: "Jamaica", phone: "1-876" },
    { code: "JO", label: "Jordan", phone: "962" },
    { code: "JP", label: "Japan", phone: "81", suggested: true },
    { code: "KE", label: "Kenya", phone: "254" },
    { code: "KG", label: "Kyrgyzstan", phone: "996" },
    { code: "KH", label: "Cambodia", phone: "855" },
    { code: "KI", label: "Kiribati", phone: "686" },
    { code: "KM", label: "Comoros", phone: "269" },
    { code: "KN", label: "Saint Kitts and Nevis", phone: "1-869" },
    { code: "KP", label: "Korea, Democratic People's Republic of", phone: "850" },
    { code: "KR", label: "Korea, Republic of", phone: "82" },
    { code: "KW", label: "Kuwait", phone: "965" },
    { code: "KY", label: "Cayman Islands", phone: "1-345" },
    { code: "KZ", label: "Kazakhstan", phone: "7" },
    { code: "LA", label: "Lao People's Democratic Republic", phone: "856" },
    { code: "LB", label: "Lebanon", phone: "961" },
    { code: "LC", label: "Saint Lucia", phone: "1-758" },
    { code: "LI", label: "Liechtenstein", phone: "423" },
    { code: "LK", label: "Sri Lanka", phone: "94" },
    { code: "LR", label: "Liberia", phone: "231" },
    { code: "LS", label: "Lesotho", phone: "266" },
    { code: "LT", label: "Lithuania", phone: "370" },
    { code: "LU", label: "Luxembourg", phone: "352" },
    { code: "LV", label: "Latvia", phone: "371" },
    { code: "LY", label: "Libya", phone: "218" },
    { code: "MA", label: "Morocco", phone: "212" },
    { code: "MC", label: "Monaco", phone: "377" },
    { code: "MD", label: "Moldova, Republic of", phone: "373" },
    { code: "ME", label: "Montenegro", phone: "382" },
    { code: "MF", label: "Saint Martin (French part)", phone: "590" },
    { code: "MG", label: "Madagascar", phone: "261" },
    { code: "MH", label: "Marshall Islands", phone: "692" },
    {
        code: "MK",
        label: "Macedonia, the Former Yugoslav Republic of",
        phone: "389"
    },
    { code: "ML", label: "Mali", phone: "223" },
    { code: "MM", label: "Myanmar", phone: "95" },
    { code: "MN", label: "Mongolia", phone: "976" },
    { code: "MO", label: "Macao", phone: "853" },
    { code: "MP", label: "Northern Mariana Islands", phone: "1-670" },
    { code: "MQ", label: "Martinique", phone: "596" },
    { code: "MR", label: "Mauritania", phone: "222" },
    { code: "MS", label: "Montserrat", phone: "1-664" },
    { code: "MT", label: "Malta", phone: "356" },
    { code: "MU", label: "Mauritius", phone: "230" },
    { code: "MV", label: "Maldives", phone: "960" },
    { code: "MW", label: "Malawi", phone: "265" },
    { code: "MX", label: "Mexico", phone: "52" },
    { code: "MY", label: "Malaysia", phone: "60" },
    { code: "MZ", label: "Mozambique", phone: "258" },
    { code: "NA", label: "Namibia", phone: "264" },
    { code: "NC", label: "New Caledonia", phone: "687" },
    { code: "NE", label: "Niger", phone: "227" },
    { code: "NF", label: "Norfolk Island", phone: "672" },
    { code: "NG", label: "Nigeria", phone: "234" },
    { code: "NI", label: "Nicaragua", phone: "505" },
    { code: "NL", label: "Netherlands", phone: "31" },
    { code: "NO", label: "Norway", phone: "47" },
    { code: "NP", label: "Nepal", phone: "977" },
    { code: "NR", label: "Nauru", phone: "674" },
    { code: "NU", label: "Niue", phone: "683" },
    { code: "NZ", label: "New Zealand", phone: "64" },
    { code: "OM", label: "Oman", phone: "968" },
    { code: "PA", label: "Panama", phone: "507" },
    { code: "PE", label: "Peru", phone: "51" },
    { code: "PF", label: "French Polynesia", phone: "689" },
    { code: "PG", label: "Papua New Guinea", phone: "675" },
    { code: "PH", label: "Philippines", phone: "63" },
    { code: "PK", label: "Pakistan", phone: "92" },
    { code: "PL", label: "Poland", phone: "48" },
    { code: "PM", label: "Saint Pierre and Miquelon", phone: "508" },
    { code: "PN", label: "Pitcairn", phone: "870" },
    { code: "PR", label: "Puerto Rico", phone: "1" },
    { code: "PS", label: "Palestine, State of", phone: "970" },
    { code: "PT", label: "Portugal", phone: "351" },
    { code: "PW", label: "Palau", phone: "680" },
    { code: "PY", label: "Paraguay", phone: "595" },
    { code: "QA", label: "Qatar", phone: "974" },
    { code: "RE", label: "Reunion", phone: "262" },
    { code: "RO", label: "Romania", phone: "40" },
    { code: "RS", label: "Serbia", phone: "381" },
    { code: "RU", label: "Russian Federation", phone: "7" },
    { code: "RW", label: "Rwanda", phone: "250" },
    { code: "SA", label: "Saudi Arabia", phone: "966" },
    { code: "SB", label: "Solomon Islands", phone: "677" },
    { code: "SC", label: "Seychelles", phone: "248" },
    { code: "SD", label: "Sudan", phone: "249" },
    { code: "SE", label: "Sweden", phone: "46" },
    { code: "SG", label: "Singapore", phone: "65" },
    { code: "SH", label: "Saint Helena", phone: "290" },
    { code: "SI", label: "Slovenia", phone: "386" },
    { code: "SJ", label: "Svalbard and Jan Mayen", phone: "47" },
    { code: "SK", label: "Slovakia", phone: "421" },
    { code: "SL", label: "Sierra Leone", phone: "232" },
    { code: "SM", label: "San Marino", phone: "378" },
    { code: "SN", label: "Senegal", phone: "221" },
    { code: "SO", label: "Somalia", phone: "252" },
    { code: "SR", label: "Suriname", phone: "597" },
    { code: "SS", label: "South Sudan", phone: "211" },
    { code: "ST", label: "Sao Tome and Principe", phone: "239" },
    { code: "SV", label: "El Salvador", phone: "503" },
    { code: "SX", label: "Sint Maarten (Dutch part)", phone: "1-721" },
    { code: "SY", label: "Syrian Arab Republic", phone: "963" },
    { code: "SZ", label: "Swaziland", phone: "268" },
    { code: "TC", label: "Turks and Caicos Islands", phone: "1-649" },
    { code: "TD", label: "Chad", phone: "235" },
    { code: "TF", label: "French Southern Territories", phone: "262" },
    { code: "TG", label: "Togo", phone: "228" },
    { code: "TH", label: "Thailand", phone: "66" },
    { code: "TJ", label: "Tajikistan", phone: "992" },
    { code: "TK", label: "Tokelau", phone: "690" },
    { code: "TL", label: "Timor-Leste", phone: "670" },
    { code: "TM", label: "Turkmenistan", phone: "993" },
    { code: "TN", label: "Tunisia", phone: "216" },
    { code: "TO", label: "Tonga", phone: "676" },
    { code: "TR", label: "Turkey", phone: "90" },
    { code: "TT", label: "Trinidad and Tobago", phone: "1-868" },
    { code: "TV", label: "Tuvalu", phone: "688" },
    { code: "TW", label: "Taiwan, Province of China", phone: "886" },
    { code: "TZ", label: "United Republic of Tanzania", phone: "255" },
    { code: "UA", label: "Ukraine", phone: "380" },
    { code: "UG", label: "Uganda", phone: "256" },
    { code: "US", label: "United States", phone: "1", suggested: true },
    { code: "UY", label: "Uruguay", phone: "598" },
    { code: "UZ", label: "Uzbekistan", phone: "998" },
    { code: "VA", label: "Holy See (Vatican City State)", phone: "379" },
    { code: "VC", label: "Saint Vincent and the Grenadines", phone: "1-784" },
    { code: "VE", label: "Venezuela", phone: "58" },
    { code: "VG", label: "British Virgin Islands", phone: "1-284" },
    { code: "VI", label: "US Virgin Islands", phone: "1-340" },
    { code: "VN", label: "Vietnam", phone: "84" },
    { code: "VU", label: "Vanuatu", phone: "678" },
    { code: "WF", label: "Wallis and Futuna", phone: "681" },
    { code: "WS", label: "Samoa", phone: "685" },
    { code: "XK", label: "Kosovo", phone: "383" },
    { code: "YE", label: "Yemen", phone: "967" },
    { code: "YT", label: "Mayotte", phone: "262" },
    { code: "ZA", label: "South Africa", phone: "27" },
    { code: "ZM", label: "Zambia", phone: "260" },
    { code: "ZW", label: "Zimbabwe", phone: "263" }
];

