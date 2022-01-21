import { React, useState, useEffect } from 'react'
import { Button, Col, Container, Form, Row, Tabs, Tab, DropdownButton, Dropdown, ButtonGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { PropagateLoader } from "react-spinners";
import { Link } from 'react-router-dom';
import ApiService from '../../../helpers/ApiServices';

export default function Vendor() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({})
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });

    const onSubmit = (formData) => {
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/vendor', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/purchase/vendors");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/vendor/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/purchase/vendors");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/vendor/${id}`).then(response => {
            console.log(response.data)
            history.push("/purchase/vendors");
        }).catch(e => {
            console.log(e);
        })

    }

    useEffect(() => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`vendor/${id}`).then(response => {
                if (response.data.isSuccess) {
                    setLoderStatus("SUCCESS");
                    console.log(response.data.document)
                    setstate(response.data.document)
                    reset(response.data.document);
                }

            }).catch(e => {
                console.log(e)
            })
        }
    }, [])


    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>{isAddMode ? "Create New Vendor" : state.name}</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/purchase/vendors" variant="light" size="sm">DISCARD</Button>{" "}
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item> */}
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" fluid>
                    <Row className="m-0 p-0">
                        {/* <Col>Header</Col>
                    <Col>
                        In:11 <br />
                        Out:10

                    </Col> */}

                    </Row>
                    <Container fluid>
                        <Row>
                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Vendor Id</Form.Label>
                                <Form.Control disabled
                                    type="text"
                                    id="vendorId"
                                    name="vendorId"
                                    {...register("vendorId")}
                                />
                            </Form.Group> */}
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    {...register("name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Phone</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="phone"
                                    name="phone"
                                    {...register("phone")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="email"
                                    name="email"
                                    {...register("email")}
                                />
                            </Form.Group>

                        </Row>

                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="address"
                                    name="address"
                                    {...register("address")}
                                />
                            </Form.Group>
                        </Row>



                    </Container>

                </Container>
            </Form>
        </Container>
    )
}
