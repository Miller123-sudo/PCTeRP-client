import { React, useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, Badge, DropdownButton, Dropdown, Modal, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsTrash } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
// import 'react-toastify/dist/ReactToastify.css';
// import ReactStopwatch from 'react-stopwatch';
// import { lightGreen } from '@material-ui/core/colors';
import ApiService from '../../../helpers/ApiServices';
import { UserContext } from '../../../components/states/contexts/UserContext';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2'
import JobComplitionList from '../jobComplition/JobComplitionList';
import ComponentIssueList from '../componentIssue/ComponentIssueList';
import GLListForCompleteJobOrderList from '../generalLedgerForCompleteJobOrder/GLListForCompleteJobOrderList';
// import 'sweetalert2/src/sweetalert2.scss'
const moment = require('moment');



const schema = yup.object().shape({
    // product: yup.string().required("Please select product"),
    // bom: yup.string().required("Please select bom"),
    components: yup.array().of(
        yup.object().shape({
            // component: yup.string().required('Please select a component'),
            quantity: yup.number("Please enter a positive number").positive("Please enter a positive number").required('Please enter a positive number'),
            // unitPrice: yup.number().typeError('you must specify a number').transform(value => (isNaN(value) ? console.log(value) : value)).positive("Please enter a positive number").required('Please enter a positive number'),
        })
    ),
}).required();


export default function CompleteJobOrder() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [tabKey, setTabKey] = useState('gls');
    const [timeStatus, settimeStatus] = useState('wating');
    const [state, setstate] = useState({});
    const [startTime, setstartTime] = useState();
    const [isQtyEqual, setisQtyEqual] = useState(false);
    const [JCTitle, setJCTitle] = useState("");
    const [employeeList, setEmployeeList] = useState([])
    const [jobComplitionList, setjobComplitionList] = useState([])
    const [glList, setglList] = useState([])
    const [componentIssueList, setcomponentIssueList] = useState([])
    const [productList, setProductList] = useState([]);
    const [accountList, setaccountList] = useState([]);
    const [AllProductList, setAllProductList] = useState([]);
    const [bomList, setBOMList] = useState([])
    const [uomList, setUOMList] = useState([]);
    const [workCenterList, setWorkCenterList] = useState([]);


    const history = useHistory();
    const { user } = useContext(UserContext)
    const { id } = useParams();
    // const id = history.location.pathname.split("/")[3];
    const isAddMode = !id;
    let endTime;
    let partialduration = "";
    let realduration = "";
    let JCtabTitle = "";
    let CItabTitle = "";
    let totalqty = 0;
    let totalissuedqty = 0;
    // let startTime;


    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            scheduledDate: new Date().toISOString().split("T")[0],
            quantity: 1
        },
        resolver: yupResolver(schema),
    });
    const { append: componentsAppend, remove: componentsRemove, fields: componentsFields } = useFieldArray({ control, name: "components" });
    const { append: operationsAppend, remove: operationsRemove, fields: operationsFields } = useFieldArray({ control, name: "operations" });

    const onSubmit = (formData) => {
        // console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        console.log(data);
        // ApiService.setHeader();
        // return ApiService.post('/jobOrder', data).then(response => {
        //     if (response.data.isSuccess) {
        //         history.push("/manufacturings/jobOrders");
        //     }
        // }).catch(e => {
        //     console.log(e);
        // })

        try {
            // const productAvailibility = await ApiService.patch(`jobOrder/checkProductAvailibility`, data);  //Check product availibility
            // console.log(productAvailibility.data);
            // if (productAvailibility.data.isAllAvailabel) {
            const res = await ApiService.post('/jobOrder/procedure', data); //Create JobOrder
            console.log(res);
            if (res.data.isSuccess) {
                history.push("/manufacturings/jobOrders");
            }

            // } else {
            //     console.log(productAvailibility.data.unavailabelProducts);
            //     if (productAvailibility.data.unavailabelProducts.length == 1) {
            //         alert(`your availability limit for component ${productAvailibility.data.unavailabelProducts[0]} is less then your total consume quantity!!! Please make sure all components are availabel in your inventory.`)
            //     } else {
            //         alert(`your availability limit for component ${productAvailibility.data.unavailabelProducts} is less then your total consume quantity!!! Please make sure all components are availabel in your inventory.`)

            //     }
            // }
        } catch (err) {
            console.log(err.response.data.message);
            alert(err.response.data.message)
        }
    }

    const updateDocument = (id, data) => {
        console.log(data);
        ApiService.setHeader();
        return ApiService.patch(`/jobOrder/${id}`, data).then(response => {
            if (response.data.isSuccess) {
                history.push("/manufacturings/jobOrders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/jobOrder/procedure/${id}`).then(response => {
            if (response.status == 204) {
                history.push("/manufacturings/jobOrders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    if (isAddMode) {
        setValue('responsible', user.id)
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");

        const employeeResponse = await ApiService.get('employee');
        if (employeeResponse.data.isSuccess) {
            setEmployeeList(employeeResponse.data.documents)
        }

        const AllproductResponse = await ApiService.get('product');
        if (AllproductResponse.data.isSuccess) {
            // console.log(AllproductResponse.data.documents);
            setAllProductList(AllproductResponse.data.documents)
        }

        const productResponse = await ApiService.get('/jobOrder/getProductsOnlyContainBOM');
        if (productResponse.data.isSuccess) {
            // console.log(productResponse.data.documents);
            setProductList(productResponse.data.documents)
        }

        const uomResponse = await ApiService.get('uom');
        if (uomResponse.data.isSuccess) {
            setUOMList(uomResponse.data.documents)
        }

        const workCenterResponse = await ApiService.get('workCenter');
        if (workCenterResponse.data.isSuccess) {
            setWorkCenterList(workCenterResponse.data.documents)
        }

        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setaccountList(accountResponse.data.documents)
        }

        ApiService.get('bom/').then(res => {
            if (res.data.isSuccess) {
                setBOMList(res.data.documents)
            }
        })

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            const gls = await ApiService.get(`/componentIssue/findGeneralLedger/${id}`)
            if (gls?.data.isSuccess) {
                console.log(gls);
                setglList(gls?.data.documents)
            }

            await ApiService.get(`completeJobOrder/${id}`).then(response => {
                const jobOrder = response.data.document;
                // console.log(jobOrder);
                setstate(jobOrder)
                reset(jobOrder);
                if (jobOrder.scheduledDate) {
                    setValue('scheduledDate', jobOrder.scheduledDate.split("T")[0]);
                }

                setLoderStatus("SUCCESS");
            }).catch(e => {
                console.log(e)
            })
        }

    }, []);



    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>

            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-1 pb-2" fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/manufacturings/joborders' }} ><h3 className="breadcrum-label">Job Orders</h3></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state?.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            {/* {
                                state?.status == "In Progress" || state?.status == "Done" ? " " : <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            } */}
                            <Button as={Link} to={`/manufacturings/joborder/${state?.sourceDocument?.id}?mode=edit`} variant="light" size="sm">DISCARD</Button>
                            {/* {!isAddMode && state.status == "Waiting" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>} */}
                        </Col>
                        {/* <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
                            </div>
                        </Col> */}
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {/* {!isAddMode ? state.componentIssue ? "" : < Button onClick={handleComponentIssue} type="button" variant="primary">COMPONENT ISSUE</Button> : " "} */}
                                {/* {isAddMode ? " " : !isQtyEqual ? < Button onClick={handleComponentIssue} type="button" variant="primary">COMPONENT ISSUE</Button> : " "}
                                <Button onClick={handleCompleteJobOrderButton} type="button" variant="primary">COMPLETE JOB ORDER</Button> */}
                                {/* {state.status == "Posted" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleConfirmButton} type="button" variant="light">ADD CREDIT NOTE</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleConfirmButton} type="button" variant="light">RESET TO DRAFT</Button> : ""} */}
                            </ButtonGroup>
                        </Col>
                        {/* <Col style={{ display: 'flex', justifyContent: 'end' }}>
                             <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> 
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
                            </div>
                        </Col> */}
                    </Row>

                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Product</Form.Label>
                                <Controller
                                    name="product"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                    (
                                        <Typeahead
                                            id="product"
                                            // labelKey='name'
                                            labelKey={option => `${option.name}`}
                                            disabled={!isAddMode ? true : false}
                                            // multiple
                                            onChange={onChange}
                                            onBlur={(e) => {
                                                console.log(e.target.value);
                                                ApiService.get('bom/searchBomByItem/' + e.target.value).then(res => {
                                                    if (res.data.isSuccess) {
                                                        setBOMList(res.data.documents)
                                                    }
                                                })
                                            }}
                                            options={productList}
                                            placeholder="Choose a product..."
                                            selected={value}
                                        />
                                    )
                                    }
                                />
                                {errors.product?.message && <p style={{ color: "red" }}>{errors.product?.message}</p>}

                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Quantity</Form.Label>
                                <Controller
                                    name="quantity"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <Form.Control min={1}
                                            type="number"
                                            disabled
                                            id="quantity"
                                            name="quantity"
                                            {...register("quantity")}
                                            onBlur={async (e) => {
                                                let array = new Array()

                                                const bom = getValues("bom")
                                                const components = getValues("components")
                                                const qty = getValues('quantity')
                                                console.log(components);
                                                if (components.length) {
                                                    // bom[0]?.components?.map(e => {
                                                    components?.map(e => {
                                                        let obj = new Object();
                                                        obj.component = e.component;
                                                        obj.bomQty = parseInt(e.bomQty);
                                                        obj.quantity = parseInt(qty) * parseInt(e.bomQty);
                                                        obj.unit = e.unit;
                                                        array.push(obj);
                                                    })
                                                    console.log(array);
                                                    setValue(`components`, array)

                                                }
                                            }}
                                            // disabled={true}
                                            selected={value}
                                        />
                                    )}
                                />

                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Scheduled Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    // disabled={true}
                                    {...register("scheduledDate")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Responsible</Form.Label>

                                <Form.Select id="responsible" name="responsible" {...register("responsible", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {employeeList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="notes"
                                    name="notes"
                                    {...register("notes")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">BOM</Form.Label>
                                <Controller
                                    name="bom"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                    (
                                        <Typeahead
                                            id="bom"
                                            labelKey='name'
                                            disabled={!isAddMode ? true : false}
                                            // multiple
                                            onChange={onChange}
                                            onBlur={async (e) => {
                                                let componentsarray = new Array()
                                                console.log(e.target.value);
                                                const qty = getValues(`quantity`)

                                                const billOfMetirials = await ApiService.get("bom/searchBomByItem/" + e.target.value)
                                                console.log(billOfMetirials?.data?.documents[0].operations);

                                                billOfMetirials?.data?.documents[0].components?.map(e => {
                                                    let obj = new Object();
                                                    obj.component = e.component;
                                                    obj.bomQty = e.quantity;
                                                    obj.quantity = parseInt(qty) * parseInt(e.quantity);
                                                    obj.unit = e.unit;
                                                    componentsarray.push(obj);
                                                })

                                                setValue(`components`, componentsarray)
                                                setValue(`operations`, billOfMetirials?.data?.documents[0].operations)
                                            }}
                                            options={bomList}
                                            placeholder="Choose a BOM..."
                                            selected={value}
                                        />
                                    )
                                    }
                                />
                                {errors.bom?.message && <p style={{ color: "red" }}>{errors.bom?.message}</p>}
                            </Form.Group>
                        </Row>
                    </Container>

                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="gls" title="GL List">
                                <GLListForCompleteJobOrderList data={glList} />
                            </Tab>

                        </Tabs>
                    </Container>
                </Container >
            </Form >

        </Container >
    )

}
