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
import CompleteJobOrderList from '../completeJobOrder/CompleteJobOrderList';
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


export default function JobOrder() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [tabKey, setTabKey] = useState('components');
    const [timeStatus, settimeStatus] = useState('wating');
    const [BtnToggl, setBtnToggl] = useState('start');
    const [state, setstate] = useState({});
    const [startTime, setstartTime] = useState();
    const [isQtyEqual, setisQtyEqual] = useState(false);
    const [ShowCJObtn, setShowCJObtn] = useState(false);
    const [JCTitle, setJCTitle] = useState("");
    const [employeeList, setEmployeeList] = useState([])
    const [jobComplitionList, setjobComplitionList] = useState([])
    const [glList, setglList] = useState([])
    const [componentIssueList, setcomponentIssueList] = useState([])
    const [productList, setProductList] = useState([]);
    const [accountList, setaccountList] = useState([]);
    const [AllProductList, setAllProductList] = useState([]);
    const [completeJobOrderList, setcompleteJobOrderList] = useState([]);
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
    let CJOtabTitle = "";
    let totqty = 0;
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

    const calculatePartialJobComplitionTime = async (index) => {
        let t = "";
        let realDuration = 0;
        let days = "";
        let hr = "";
        let min = "";
        let sec = "";
        let endTime = moment(new Date())

        var diff = moment.duration(endTime.diff(moment(new Date(state?.operations[index].startTimeForJC))));
        console.log("diff(moment): ", diff)
        if (diff._data.days < 0) {
            days = diff._data.days * -1
        } else {
            days = diff._data.days
        }
        if (diff._data.hours < 0) {
            hr = diff._data.hours * -1
        } else {
            hr = diff._data.hours
        }
        if (diff._data.minutes < 0) {
            min = diff._data.minutes * -1
        } else {
            min = diff._data.minutes
        }
        if (diff._data.seconds < 0) {
            sec = diff._data.seconds * -1
        } else {
            sec = diff._data.seconds
        }
        console.log("diff(moment): ", `${days} days ${hr} hours ${min} minutes`)
        partialduration = `${days} : ${hr} : ${min} : ${sec}`;
    }

    const calculateTotalDurationForOperation = async (index) => {
        let t = "";
        let realDuration = 0;
        let days = "";
        let hr = "";
        let min = "";
        let sec = "";
        let endTime = moment(new Date())

        var diff = moment.duration(endTime.diff(moment(new Date(state?.operations[index].startTime))));
        console.log("diff(moment): ", diff)
        if (diff._data.days < 0) {
            days = diff._data.days * -1
        } else {
            days = diff._data.days
        }
        if (diff._data.hours < 0) {
            hr = diff._data.hours * -1
        } else {
            hr = diff._data.hours
        }
        if (diff._data.minutes < 0) {
            min = diff._data.minutes * -1
        } else {
            min = diff._data.minutes
        }
        if (diff._data.seconds < 0) {
            sec = diff._data.seconds * -1
        } else {
            sec = diff._data.seconds
        }
        console.log("diff(moment): ", `${days} days ${hr} hours ${min} minutes`)
        realduration = `${days} : ${hr} : ${min} : ${sec}`;
    }

    const updateJobOrderAndCreateJobComplition = async (data, operationIdentifier) => {
        console.log("operationIdentifier", operationIdentifier);

        ApiService.setHeader();
        await ApiService.patch(`/jobOrder/${id}`, data).then(async response => {
            if (response?.data?.isSuccess) {
                console.log(response?.data?.document);
                setstate(response?.data?.document)
                reset(response?.data?.document);
                setValue('scheduledDate', response?.data?.document.scheduledDate.split("T")[0]);

                // create Job Complition
                try {
                    const jobComplition = await ApiService.post('jobComplition/procedure/' + operationIdentifier, response?.data?.document)
                    if (jobComplition.data.isSuccess) {

                        // Swal.fire({
                        //     position: 'top',
                        //     title: `A JobComplition is created. Please see in Related records tab for details...`,
                        //     showConfirmButton: false,
                        //     timer: 6000
                        // })
                        // history.push("/manufacturings/jobOrders");
                        const gl = await ApiService.post(`jobComplition/createGeneralLedger`, jobComplition.data.document)
                        if (gl.data.isSuccess) {
                            // await ApiService.patch('jobComplition/pushWipAccGLToJO', { data: gl.data.documents, id: id });

                            const res = await ApiService.get('jobOrder/findJobComplitions/' + id);
                            if (res.data.isSuccess) {
                                setjobComplitionList(res.data.documents)

                                //Set Job Order data
                                setstate(response?.data?.document)
                                reset(response?.data?.document);
                                setValue('scheduledDate', response?.data?.document.scheduledDate.split("T")[0]);
                            }
                        }

                        // const res = await ApiService.get('jobOrder/findJobComplitions/' + id);
                        // if (res.data.isSuccess) {
                        //     setjobComplitionList(res.data.documents)

                        //     //Set Job Order data
                        //     setstate(response?.data?.document)
                        //     reset(response?.data?.document);
                        //     setValue('scheduledDate', response?.data?.document.scheduledDate.split("T")[0]);
                        // }
                    }
                } catch (err) {
                    console.log(err);
                    Swal.fire({
                        position: 'top',
                        title: err,
                        showConfirmButton: false,
                        timer: 6000
                    })
                }

            }
        }).catch(e => {
            console.log(e);
            alert(e)
        })
    }

    const handleComponentIssue = async () => {
        try {
            const res = await ApiService.post('/componentIssue/procedure', state); //Create JobOrder
            console.log(res);
            if (res.data.isSuccess) {
                history.push(`/manufacturings/componentIssue/${res.data.document.id}?mode=edit`);

                // update Component Products on JobOrder done
                // try {
                //     const r = await ApiService.patch(`/jobOrder/updateComponentProducts`, res?.data?.document)

                // } catch (err) {
                //     Swal.fire({
                //         position: 'top',
                //         title: err,
                //         showConfirmButton: false,
                //         timer: 6000
                //     })
                // }

            }

        } catch (err) {
            console.log(err);
            Swal.fire({
                position: 'top',
                title: err,
                showConfirmButton: false,
                timer: 6000
            })
        }
    }

    const handleCompleteJobOrderButton = async () => {
        let totalQty = 0;
        let totalCIQty = 0;
        let totalCJOQty = 0;

        if (completeJobOrderList?.length == 0) {
            totalCIQty = componentIssueList?.reduce((previousValue, currentValue) => {
                return previousValue + currentValue.quantity;
            }, 0);
            console.log("totalCIQty: ", totalCIQty);
            totalQty = totalCIQty;
            console.log("totalQty when no CJO :", totalQty);
        } else {
            totalCIQty = componentIssueList?.reduce((previousValue, currentValue) => {
                return previousValue + currentValue.quantity;
            }, 0);
            console.log("totalCIQty: ", totalCIQty);

            totalCJOQty = completeJobOrderList?.reduce((previousValue, currentValue) => {
                return previousValue + currentValue.quantity;
            }, 0);
            console.log("totalCJOQty: ", totalCJOQty);

            totalQty = totalCIQty - totalCJOQty;
            console.log("totalQty when one or more CJO :", totalQty);
        }

        // let totalCIQty = componentIssueList?.reduce((previousValue, currentValue) => {
        //     return previousValue + currentValue.quantity;
        // }, 0);
        // console.log("totalCIQty: ", totalCIQty);
        if (totalQty == 0) {
            Swal.fire({
                position: 'top',
                title: `Either You have completed all quantity of the job order or Please Issue component first ℹ️`,
                showConfirmButton: false,
                timer: 6000
            })
        } else {

            let isEqualtotalCIQty = state?.operations?.every((e) => totalCIQty == e.qtyDone)
            console.log("isEqualtotalCIQty: ", isEqualtotalCIQty);

            if (isEqualtotalCIQty) {
                try {
                    const completeJobOrder = await ApiService.post(`completeJobOrder/procedure`, { state: state, qty: totalQty });
                    if (completeJobOrder.data.isSuccess) {
                        history.push(`/manufacturings/completeJobOrder/${completeJobOrder.data.document.id}?mode=edit`)
                    }
                } catch (err) {
                    console.log(err);
                    Swal.fire({
                        position: 'top',
                        title: err,
                        showConfirmButton: false,
                        timer: 6000
                    })
                }
            } else {
                Swal.fire({
                    position: 'top',
                    title: `Issue qty and each operation done qty not same`,
                    showConfirmButton: false,
                    timer: 6000
                })
            }
        }

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

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            const res = await ApiService.get('jobOrder/findJobComplitions/' + id);
            if (res.data.isSuccess) {
                setjobComplitionList(res.data.documents)
            }

            const ComponentIssues = await ApiService.get('jobOrder/findComponentIssues/' + id);
            if (ComponentIssues.data.isSuccess) {
                setcomponentIssueList(ComponentIssues.data.documents)
            }

            const CompleteJobOrders = await ApiService.get('jobOrder/findCompleteJobOrders/' + id);
            if (CompleteJobOrders.data.isSuccess) {
                setcompleteJobOrderList(CompleteJobOrders.data.documents)
            }

            // Check total completeJobOrder qty and total componentIssue qty are equal or not to show "complete job order" button
            let totalCJOL = 0;
            let totalCIL = 0;
            totalCJOL = completeJobOrderList?.reduce((previousValue, currentValue) => {
                return previousValue + currentValue.quantity;
            }, 0);
            totalCIL = componentIssueList?.reduce((previousValue, currentValue) => {
                return previousValue + currentValue.quantity;
            }, 0);
            if (totalCIL == totalCJOL) {
                setShowCJObtn(false)
            } else {
                setShowCJObtn(true)
            }

            await ApiService.get(`jobOrder/${id}`).then(response => {
                const jobOrder = response.data.document;
                // console.log(jobOrder);
                setstate(jobOrder)
                reset(jobOrder);
                if (jobOrder.scheduledDate) {
                    setValue('scheduledDate', jobOrder.scheduledDate.split("T")[0]);
                }

                // Check JO qty is equal to total CI qty
                ComponentIssues?.data?.documents?.map(e => {
                    totqty += parseInt(e.quantity);
                })
                if (totqty - parseInt(getValues('quantity')) == 0) {
                    setisQtyEqual(true)
                } else {
                    setisQtyEqual(false)
                }

                setLoderStatus("SUCCESS");
            }).catch(e => {
                console.log(e)
            })
        }

    }, []);

    JCtabTitle = `Job Completions ${jobComplitionList.length}`
    CItabTitle = `Component Issues ${componentIssueList.length}`
    CJOtabTitle = `Complete Job Orders ${completeJobOrderList.length}`
    console.log("state:", state);
    console.log("CItabTitle:", CItabTitle);
    console.log("isQtyEqual:", isQtyEqual);
    console.log("ShowCJObtn:", ShowCJObtn);



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
                            {
                                state?.status == "In Progress" || state?.status == "Done" ? " " : <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            }
                            <Button as={Link} to="/manufacturings/joborders" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && state.status == "Waiting" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
                            </div>
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {/* {!isAddMode ? state.componentIssue ? "" : < Button onClick={handleComponentIssue} type="button" variant="primary">COMPONENT ISSUE</Button> : " "} */}
                                {isAddMode ? " " : !isQtyEqual ? < Button onClick={handleComponentIssue} type="button" variant="primary">COMPONENT ISSUE</Button> : " "}
                                {!isAddMode && <Button onClick={handleCompleteJobOrderButton} type="button" variant="primary">COMPLETE JOB ORDER</Button>}
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
                            <Tab eventKey="components" title="Components">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Components</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th style={{ minWidth: "16rem" }}>Component</th>
                                                    <th style={{ minWidth: "16rem" }}>BOM qty</th>
                                                    <th style={{ minWidth: "16rem" }}>To Consume</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Issued Qty</th>}
                                                    <th style={{ minWidth: "16rem" }}>Unit</th>
                                                    {/* <th></th> */}

                                                </tr>
                                            </thead>
                                            <tbody>

                                                {componentsFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <Form.Group>
                                                                <Controller
                                                                    name={`components.${index}.component`}
                                                                    control={control}
                                                                    defaultValue=""
                                                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                                                    (
                                                                        <Typeahead
                                                                            id="component"
                                                                            labelKey='name'
                                                                            disabled={!isAddMode ? true : false}
                                                                            // multiple
                                                                            onChange={onChange}
                                                                            onBlur={() => {
                                                                                setValue(`components.${index}.quantity`, parseInt(getValues(`components.${index}.bomQty`)) * parseInt(getValues(`quantity`)))
                                                                            }}
                                                                            options={AllProductList}
                                                                            placeholder="Choose a component..."
                                                                            selected={value}
                                                                        />
                                                                    )
                                                                    }
                                                                />
                                                                {errors?.['components']?.[index]?.['component']?.['message'] && <p style={{ color: "red" }}>{errors?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="bomQty"
                                                                    disabled={!isAddMode ? true : false}
                                                                    name="bomQty"

                                                                    {...register(`components.${index}.bomQty`)}
                                                                    onBlur={() => {
                                                                        setValue(`components.${index}.quantity`, parseInt(getValues(`components.${index}.bomQty`)) * parseInt(getValues(`quantity`)))
                                                                    }}
                                                                >
                                                                </Form.Control>
                                                                {errors?.['components']?.[index]?.['bomQty']?.['message'] && <p style={{ color: "red" }}>{errors?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    disabled={!isAddMode ? true : false}
                                                                    name="quantity"
                                                                    {...register(`components.${index}.quantity`)}
                                                                >
                                                                </Form.Control>
                                                                {errors?.['components']?.[index]?.['quantity']?.['message'] && <p style={{ color: "red" }}>{errors?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>

                                                        {
                                                            !isAddMode && (
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="number"
                                                                            id="issuedQty"
                                                                            disabled
                                                                            name="issuedQty"
                                                                            {...register(`components.${index}.issuedQty`)}
                                                                        >
                                                                        </Form.Control>
                                                                        {errors?.['components']?.[index]?.['issuedQty']?.['message'] && <p style={{ color: "red" }}>{errors?.['message']}</p>}
                                                                    </Form.Group>
                                                                </td>
                                                            )
                                                        }

                                                        <td>
                                                            <Form.Group>
                                                                <Controller
                                                                    name={`components.${index}.unit`}
                                                                    control={control}
                                                                    defaultValue=""
                                                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                                                    (
                                                                        <Typeahead
                                                                            id="unit"
                                                                            labelKey='name'
                                                                            disabled={!isAddMode ? true : false}
                                                                            // multiple
                                                                            onChange={onChange}
                                                                            options={uomList}
                                                                            placeholder="Choose a unit..."
                                                                            selected={value}
                                                                        />
                                                                    )
                                                                    }
                                                                />
                                                            </Form.Group>
                                                        </td>

                                                        {
                                                            !isAddMode ? " " : (<td>
                                                                <Button size="sm" variant="light"
                                                                    onClick={() => {
                                                                        componentsRemove(index)

                                                                    }}
                                                                ><BsTrash /></Button>
                                                            </td>)
                                                        }

                                                    </tr>
                                                    )
                                                })}
                                                {
                                                    !isAddMode ? " " : (
                                                        <tr>
                                                            <td colSpan="14">
                                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => componentsAppend({ component: null, bomQty: 1, quantity: 1, unit: null })} >Add a line</Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                }

                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="operations" title="Operations">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Operations</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Operation(dev)</th>
                                                    <th style={{ minWidth: "16rem" }}>Work Center</th>
                                                    <th style={{ minWidth: "16rem" }}>Cost Per Minute</th>
                                                    <th style={{ minWidth: "16rem" }}>Account</th>
                                                    <th style={{ minWidth: "10rem" }}>Start Date</th>
                                                    <th style={{ minWidth: "10rem" }}>Start Date(factual)</th>
                                                    <th style={{ minWidth: "10rem" }}>End Date</th>
                                                    <th style={{ minWidth: "10rem" }}>Expected Duration</th>
                                                    <th style={{ minWidth: "10rem" }}>Real Duration</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Qty done</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Qty remain</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Status</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Action</th>}
                                                    {/* <th></th> */}

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {operationsFields.map((field, index) => {
                                                    return <tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control id="operation" name="operation" {...register(`operations.${index}.operation`)}>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Controller
                                                                    name={`operations.${index}.workCenter`}
                                                                    control={control}
                                                                    defaultValue=""
                                                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                                                    (
                                                                        <Typeahead
                                                                            id="workCenter"
                                                                            labelKey='name'
                                                                            // multiple
                                                                            onChange={onChange}
                                                                            options={workCenterList}
                                                                            placeholder="Choose a workCenter..."
                                                                            selected={value}
                                                                        />
                                                                    )
                                                                    }
                                                                />

                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="costPerUnit"
                                                                    name="costPerUnit"
                                                                    {...register(`operations.${index}.costPerUnit`)}
                                                                />

                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Controller
                                                                    name={`operations.${index}.account`}
                                                                    control={control}
                                                                    defaultValue=""
                                                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                                                    (
                                                                        <Typeahead
                                                                            id="account"
                                                                            labelKey='name'
                                                                            // multiple
                                                                            onChange={onChange}
                                                                            options={accountList}
                                                                            placeholder="Choose a account..."
                                                                            selected={value}
                                                                        />
                                                                    )
                                                                    }
                                                                />

                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled type="text" id="startDate" name="startDate" {...register(`operations.${index}.startDate`)}>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled type="text" id="startDateTimeForJC" name="startDateTimeForJC" {...register(`operations.${index}.startDateTimeForJC`)}>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="text"
                                                                    id="endDate"
                                                                    name="endDate"
                                                                    {...register(`operations.${index}.endDate`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="expectedDuration"
                                                                    name="expectedDuration"
                                                                    {...register(`operations.${index}.expectedDuration`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>

                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="realDuration"
                                                                    disabled
                                                                    name="realDuration"
                                                                    {...register(`operations.${index}.realDuration`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        {!isAddMode && <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    disabled
                                                                    id="status"
                                                                    name="status"
                                                                    disabled
                                                                    {...register(`operations.${index}.qtyDone`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>}

                                                        {!isAddMode && <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    disabled
                                                                    id="status"
                                                                    name="status"
                                                                    disabled
                                                                    {...register(`operations.${index}.qtyRemain`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>}

                                                        {!isAddMode && <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="status"
                                                                    name="status"
                                                                    disabled
                                                                    {...register(`operations.${index}.status`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>}

                                                        {!isAddMode && state.operations[index].status == "Waiting" ? (<td>

                                                            <Button style={{ minWidth: "4rem" }} size="sm" variant="primary"
                                                                onClick={async () => {
                                                                    // Check total issue qty and every line qtyDone is equal or not
                                                                    let t = 0;
                                                                    componentIssueList?.map(e => {
                                                                        t += parseInt(e.quantity);
                                                                    })
                                                                    const lineStatus = getValues('operations')
                                                                    const isSame = lineStatus.every(e => e.qtyDone == t)
                                                                    console.log(isSame);
                                                                    if (isSame) {
                                                                        Swal.fire({
                                                                            position: 'top',
                                                                            title: `Please issue component first ℹ️`,
                                                                            showConfirmButton: false,
                                                                            timer: 4000
                                                                        })
                                                                    } else {
                                                                        if (state.status !== "Waiting") {
                                                                            // setValue(`operations.${index}.startDate`, new Date().toISOString().split("T")[0])
                                                                            setValue(`operations.${index}.status`, "In Progress")
                                                                            setValue(`status`, "In Progress")
                                                                            // let starttime = new Date().toLocaleString().split(",")[1].split(" ")[1]
                                                                            let starttime = new Date()
                                                                            console.log(starttime);
                                                                            if (state?.operations[index].isOnce) {
                                                                                setValue(`operations.${index}.startDate`, String(new Date()))
                                                                                setValue(`operations.${index}.startTime`, String(starttime))
                                                                            }
                                                                            // setstartTime(starttime)
                                                                            setValue(`operations.${index}.startTimeForJC`, String(starttime))
                                                                            // setValue(`operations.${index}.startDateTimeForJC`, new Date().toLocaleString())
                                                                            setValue(`operations.${index}.startDateTimeForJC`, String(new Date()))
                                                                            setValue(`operations.${index}.operationIdentifier`, index)

                                                                            let getdata;
                                                                            await ApiService.get(`/jobOrder/${id}`).then(async res => {
                                                                                if (res.data.isSuccess) {
                                                                                    console.log(res?.data.document);
                                                                                    getdata = res?.data.document;

                                                                                    const data = getValues();
                                                                                    console.log(data);
                                                                                    data.wipAccountGL = res?.data.document.wipAccountGL;
                                                                                    ApiService.setHeader();
                                                                                    // if (state.status !== "Waiting") {
                                                                                    await ApiService.patch(`/jobOrder/${id}`, data).then(response => {
                                                                                        if (response.data.isSuccess) {
                                                                                            // history.push("/manufacturings/jobOrders");
                                                                                            setstate(response.data.document)
                                                                                            reset(response.data.document);
                                                                                            setValue('scheduledDate', response.data.document.scheduledDate.split("T")[0]);
                                                                                        }
                                                                                    }).catch(e => {
                                                                                        console.log(e);
                                                                                        alert(e)
                                                                                    })
                                                                                }
                                                                            })

                                                                            // const data = getValues();
                                                                            // console.log(data);
                                                                            // data.wipAccountGL=
                                                                            // ApiService.setHeader();
                                                                            // // if (state.status !== "Waiting") {
                                                                            // await ApiService.patch(`/jobOrder/${id}`, data).then(response => {
                                                                            //     if (response.data.isSuccess) {
                                                                            //         // history.push("/manufacturings/jobOrders");
                                                                            //         setstate(response.data.document)
                                                                            //         reset(response.data.document);
                                                                            //         setValue('scheduledDate', response.data.document.scheduledDate.split("T")[0]);
                                                                            //     }
                                                                            // }).catch(e => {
                                                                            //     console.log(e);
                                                                            //     alert(e)
                                                                            // })
                                                                        } else {
                                                                            Swal.fire({
                                                                                position: 'top',
                                                                                title: `Job Order is not in Release state. Please issue component first.`,
                                                                                showConfirmButton: false,
                                                                                timer: 4000
                                                                            })
                                                                        }
                                                                    }
                                                                }}
                                                            >Start</Button>
                                                        </td>) : ""}

                                                        {!isAddMode && state.operations[index].status == "In Progress" ? (<td>
                                                            <Button style={{ minWidth: "4rem" }} size="sm" variant="warning"
                                                                onClick={() => {
                                                                    //Show input alert
                                                                    Swal.fire({
                                                                        title: `Enter quantity`,
                                                                        text: "Enter quantity...",
                                                                        input: 'text',
                                                                        showCancelButton: true
                                                                    }).then(async (result) => {
                                                                        console.log("Result: " + result.value);
                                                                        if (result.value) {
                                                                            if (parseInt(result.value) > parseInt(state.quantity)) {
                                                                                Swal.fire({
                                                                                    position: 'top',
                                                                                    title: `You have entered greter value then required quantity(${state.quantity})`,
                                                                                    showConfirmButton: false,
                                                                                    timer: 4000
                                                                                })
                                                                            } else {
                                                                                //do some work
                                                                                setValue(`operations.${index}.isOnce`, false)
                                                                                const qtydone = getValues(`operations.${index}.qtyDone`)
                                                                                // setValue(`operations.${index}.endDate`, new Date().toISOString().split("T")[0])
                                                                                // let d = new Date().toLocaleString();
                                                                                let d = new Date();
                                                                                setValue(`operations.${index}.endDate`, String(d))
                                                                                setValue(`operations.${index}.qtyForJC`, parseInt(result.value))
                                                                                setValue(`operations.${index}.qtyDone`, parseInt(qtydone) + parseInt(result.value))
                                                                                setValue(`operations.${index}.qtyRemain`, parseInt(state.quantity) - (parseInt(result.value) + parseInt(qtydone)))
                                                                                // settimeStatus('done')
                                                                                if (parseInt(state.quantity) - (parseInt(result.value) + parseInt(qtydone)) == 0) {
                                                                                    setValue(`operations.${index}.status`, "Done")
                                                                                    calculatePartialJobComplitionTime(index);
                                                                                    calculateTotalDurationForOperation(index);
                                                                                    setValue(`operations.${index}.durationForJC`, partialduration)
                                                                                    setValue(`operations.${index}.realDuration`, realduration)

                                                                                    // set document status
                                                                                    const lineStatus = getValues('operations')
                                                                                    console.log(lineStatus);
                                                                                    const isDone = lineStatus.every(e => e.status == "Done")
                                                                                    console.log(isDone);
                                                                                    if (isDone) {
                                                                                        setValue("status", "Done")
                                                                                    } else {
                                                                                        setValue('status', "In Progress")
                                                                                    }

                                                                                    // Update Job Order and create Job Complition
                                                                                    const data = getValues();
                                                                                    console.log(data);
                                                                                    updateJobOrderAndCreateJobComplition(data, index);

                                                                                } else if (parseInt(state.quantity) - (parseInt(result.value) + parseInt(qtydone)) > 0) {
                                                                                    // setValue(`operations.${index}.status`, "In Progress")
                                                                                    setValue(`operations.${index}.status`, "Waiting")
                                                                                    calculatePartialJobComplitionTime(index);
                                                                                    console.log(partialduration);
                                                                                    setValue(`operations.${index}.durationForJC`, partialduration)


                                                                                    // set document status
                                                                                    const lineStatus = getValues('operations')
                                                                                    console.log(lineStatus);
                                                                                    const isDone = lineStatus.every(e => e.status == "Done")
                                                                                    console.log(isDone);
                                                                                    if (isDone) {
                                                                                        setValue("status", "Done")
                                                                                    } else {
                                                                                        setValue('status', "In Progress")
                                                                                    }


                                                                                    // Update Job Order and create Job Complition
                                                                                    let getdata;
                                                                                    await ApiService.get(`/jobOrder/${id}`).then(async res => {
                                                                                        if (res.data.isSuccess) {
                                                                                            console.log(res?.data.document);
                                                                                            getdata = res?.data.document;

                                                                                            const data = getValues();
                                                                                            data.wipAccountGL = res?.data.document.wipAccountGL;
                                                                                            console.log(data);
                                                                                            updateJobOrderAndCreateJobComplition(data, index);
                                                                                        }
                                                                                    })
                                                                                    // const data = getValues();
                                                                                    // console.log(data);
                                                                                    // updateJobOrderAndCreateJobComplition(data, index);

                                                                                    // Update startTimeForJC
                                                                                    // setValue(`operations.${index}.startTimeForJC`, d.split(",")[1].split(" ")[1])
                                                                                    // setValue(`operations.${index}.startTimeForJC`, String(d))
                                                                                    // setValue(`operations.${index}.startDateTimeForJC`, String(d))
                                                                                    // const alldata = getValues();
                                                                                    // console.log(alldata);
                                                                                    // try {
                                                                                    //     await ApiService.patch(`/jobOrder/${id}`, alldata).then(async response => {

                                                                                    //     }).catch(e => {
                                                                                    //         console.log(e);
                                                                                    //         Swal.fire({
                                                                                    //             position: 'top',
                                                                                    //             title: e,
                                                                                    //             showConfirmButton: false,
                                                                                    //             timer: 7000
                                                                                    //         })
                                                                                    //     })
                                                                                    // } catch (err) {
                                                                                    //     console.log(err);
                                                                                    //     Swal.fire({
                                                                                    //         position: 'top',
                                                                                    //         title: err,
                                                                                    //         showConfirmButton: false,
                                                                                    //         timer: 7000
                                                                                    //     })
                                                                                    // }

                                                                                }

                                                                            }
                                                                        } else if (result.value == "undefined" || result.value == "") {
                                                                            Swal.fire({
                                                                                position: 'top',
                                                                                title: `Please enter some value`,
                                                                                showConfirmButton: false,
                                                                                timer: 3000
                                                                            })
                                                                        }
                                                                    });

                                                                }}
                                                            >Done</Button>

                                                        </td>) : ""}


                                                        {/* <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    operationsRemove(index)

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td> */}
                                                    </tr>
                                                })}

                                                {/* <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => operationsAppend({})} >Add a line</Button>
                                                    </td>
                                                </tr> */}


                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab >
                            {
                                jobComplitionList.length > 0 && <Tab eventKey="jobcomplitions" title={JCtabTitle ? JCtabTitle : "Job Completions"}>
                                    <JobComplitionList data={jobComplitionList} />
                                </Tab>
                            }
                            {
                                componentIssueList.length > 0 && <Tab eventKey="componentIssue" title={CItabTitle ? CItabTitle : "Component Issue"}>
                                    <ComponentIssueList data={componentIssueList} />
                                </Tab>
                            }
                            {
                                completeJobOrderList.length > 0 && <Tab eventKey="completeJobOrder" title={CJOtabTitle ? CJOtabTitle : "Complete Job Order"}>
                                    <CompleteJobOrderList data={completeJobOrderList} />
                                </Tab>
                            }

                        </Tabs >
                    </Container >

                </Container >
            </Form >

        </Container >
    )

}
