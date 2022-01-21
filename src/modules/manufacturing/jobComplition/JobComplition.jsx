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
import GLListForJobComplition from '../generalLedgerForJobComplition/GLListForJobComplition';
// import 'sweetalert2/src/sweetalert2.scss'
const moment = require('moment');



export default function JobComplition() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({});
    const [tabKey, setTabKey] = useState('gls');
    const [productList, setProductList] = useState([]);
    const [glList, setglList] = useState([]);
    const [bomList, setBOMList] = useState([])
    const [accountList, setaccountList] = useState([]);

    const history = useHistory();
    const { user } = useContext(UserContext)
    const { id } = useParams();
    // const id = history.location.pathname.split("/")[3];
    const isAddMode = !id;


    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            scheduledDate: new Date().toISOString().split("T")[0],
            quantity: 1
        },

    });

    const onSubmit = (formData) => {
        // console.log(formData);
        // return isAddMode
        //     ? createDocument(formData)
        //     : updateDocument(id, formData);
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

        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setaccountList(accountResponse.data.documents)
        }

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

            await ApiService.get(`jobComplition/${id}`).then(response => {
                const jobOrder = response.data.document;
                console.log(jobOrder);
                setstate(jobOrder)
                reset(jobOrder);
                if (jobOrder.date) {
                    setValue('date', jobOrder.date.split("T")[0]);
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
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: `/manufacturings/joborder/${state?.sourceDocument?.id}?mode=edit` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state?.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            {/* {
                                state.status == "In Progress" || state.status == "Done" ? " " : <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            } */}
                            <Button as={Link} to={`/manufacturings/joborder/${state?.sourceDocument?.id}?mode=edit`} variant="light" size="sm">DISCARD</Button>
                            {/* {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>} */}
                        </Col>
                        {/* <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
                            </div>
                        </Col> */}
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    {/* <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && <Button onClick={handleInvoicePrinting} type="button" variant="primary">PRINT INVOICE</Button>}
                                {state.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleConfirmButton} type="button" variant="light">ADD CREDIT NOTE</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleConfirmButton} type="button" variant="light">RESET TO DRAFT</Button> : ""}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                             <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> 
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
                            </div>
                        </Col>
                    </Row> */}

                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Source Document</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="sourceDocument"
                                    name="sourceDocument"
                                    disabled={!isAddMode ? true : false}
                                    // disabled={true}
                                    {...register("sourceDocument.name")}
                                />
                            </Form.Group>
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
                                            options={productList}
                                            placeholder="Choose a product..."
                                            selected={value}
                                        />
                                    )
                                    }
                                />
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
                                            disabled={!isAddMode ? true : false}
                                            {...register("quantity")}
                                            // disabled={true}
                                            selected={value}
                                        />
                                    )}
                                />

                            </Form.Group>

                        </Row>

                        <Row>
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
                                            disabled={!isAddMode ? true : false}
                                            options={bomList}
                                            placeholder="Choose a BOM..."
                                            selected={value}
                                        />
                                    )
                                    }
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Created At</Form.Label>
                                <Form.Control
                                    type="date"
                                    disabled={!isAddMode ? true : false}
                                    id="date"
                                    name="date"
                                    {...register("date")}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Operation Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    disabled={!isAddMode ? true : false}
                                    id="operationName"
                                    name="operationName"
                                    {...register("operationName")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Start Time</Form.Label>
                                <Form.Control
                                    type="text"
                                    disabled={!isAddMode ? true : false}
                                    id="startTime"
                                    name="startTime"
                                    {...register("startTime")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">End Time</Form.Label>
                                <Form.Control
                                    type="text"
                                    disabled={!isAddMode ? true : false}
                                    id="endTime"
                                    name="endTime"
                                    {...register("endTime")}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Duration(days:hr:min:sec)</Form.Label>
                                <Form.Control
                                    type="text"
                                    disabled={!isAddMode ? true : false}
                                    id="duration"
                                    name="duration"
                                    {...register("duration")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Cost Per Minute</Form.Label>
                                <Form.Control
                                    type="number"
                                    disabled={!isAddMode ? true : false}
                                    id="costPerUnit"
                                    name="costPerUnit"
                                    {...register("costPerUnit")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Account</Form.Label>
                                <Controller
                                    name={`account`}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) =>

                                    (
                                        <Typeahead
                                            id="account"
                                            labelKey='name'
                                            disabled
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

                        </Row>
                    </Container>

                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="gls" title="GL List">
                                <GLListForJobComplition data={glList} />
                            </Tab>

                        </Tabs>
                    </Container>

                </Container >
            </Form >

        </Container >
    )

}
