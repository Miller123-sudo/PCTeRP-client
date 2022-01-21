import { React, useState, useEffect, useRef } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Breadcrumb, Table, DropdownButton, Dropdown } from 'react-bootstrap';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useHistory, useParams } from 'react-router';

// import { Select, Tag } from 'antd';
import ApiService from '../../../helpers/ApiServices';
// const { Option } = Select;

export default function Employee() {
    const [state, setstate] = useState({ total: 0 });
    const [tabKey, setTabKey] = useState('privateInformation');
    const [employeeList, setEmployeeList] = useState();
    const [jobPositionList, setJobPositionList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            supervisor: null,
            location: null,
            department: null
        }
    });
    const password = useRef({});
    password.current = watch("password", "");

    const roles = [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'Sales Manager' },
        { id: 3, name: 'Account Manager' }
    ]

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/employee', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/employees");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/employee/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/employees");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/employee/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                history.push("/employees");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    useEffect(async () => {
        const employeeResponse = await ApiService.get('employee');
        console.log(employeeResponse.data.documents)
        if (employeeResponse.data.isSuccess) {
            setEmployeeList(employeeResponse.data.documents)
        }

        const jobPositionResponse = await ApiService.get('jobPosition');
        if (jobPositionResponse.data.isSuccess) {
            setJobPositionList(jobPositionResponse.data.documents)
        }

        const departmentResponse = await ApiService.get('department');
        if (departmentResponse.data.isSuccess) {
            setDepartmentList(departmentResponse.data.documents)
        }

        const locationResponse = await ApiService.get('location');
        if (locationResponse.data.isSuccess) {
            setLocationList(locationResponse.data.documents)
        }




        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`employee/${id}`).then(response => {
                const employee = response.data.document;
                setstate(employee)
                reset(employee);
                if (employee.date) {
                    setValue('date', employee.date.split("T")[0])
                }

            }).catch(e => {
                console.log(e)
            })
        }
    }, []);

    console.log(errors.passwordConfirm)

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/employees' }} ><h3 className="breadcrum-label">Employees</h3></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/employees" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    {...register("firstName")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    {...register("lastName")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Job Position</Form.Label>
                                {/* <Controller
                                    control={control}
                                    defaultValue={jobPositions.map(c => c.value)}
                                    name="jobTitle"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <Select
                                            inputRef={ref}
                                            value={jobPositions.filter(c => value.includes(c.value))}
                                            onChange={val => onChange(val.map(c => c.value))}
                                            options={jobPositions}

                                        />
                                    )}
                                /> */}
                                <Form.Select
                                    id="jobTitle"
                                    name="jobTitle"
                                    {...register("jobTitle")}
                                >
                                    <option value={null}>Choose..</option>
                                    {jobPositionList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                    </Container>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Phone</Form.Label>
                                <Form.Control
                                    type="text"
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
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Supervisor</Form.Label>
                                <Form.Select
                                    id="supervisor"
                                    name="supervisor"
                                    {...register("supervisor")}
                                >
                                    <option value={null}>Choose..</option>
                                    {employeeList && employeeList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="privateInformation" title="Private Informations">
                                <Container className="mt-2" fluid>
                                    <Row>
                                        <Form.Group as={Col} md="4" className="mb-2">
                                            <Form.Label className="m-0">Role</Form.Label>
                                            <Form.Select
                                                id="role"
                                                name="role"
                                                {...register("role")}
                                            >
                                                <option value={null}>Choose..</option>
                                                {roles && roles.map((element, index) => {
                                                    return <option key={index} value={element.name}>{element.name}</option>
                                                })}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group as={Col} md="4" className="mb-2">
                                            <Form.Label className="m-0">Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                id="password"
                                                name="password"

                                                {...register("password")}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} md="4" className="mb-2">
                                            <Form.Label className="m-0">Password Confirm</Form.Label>
                                            <Form.Control
                                                type="password"
                                                id="passwordConfirm"
                                                name="passwordConfirm"
                                                isInvalid={errors.passwordConfirm}
                                                {...register("passwordConfirm", { validate: value => value === password.current || "The passwords do not match" })}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.passwordConfirm?.message}
                                            </Form.Control.Feedback>

                                        </Form.Group>
                                    </Row>
                                </Container>
                            </Tab>
                            <Tab eventKey="workInformation" title="Work Informations">
                                <Container className="mt-2" fluid>
                                    <Row>
                                        <Form.Group as={Col} md="4" className="mb-2">
                                            <Form.Label className="m-0">Work Location</Form.Label>
                                            <Form.Select
                                                id="location"
                                                name="location"
                                                {...register("location")}
                                            >
                                                <option value={null}>Choose..</option>
                                                {locationList.map((element, index) => {
                                                    return <option key={index} value={element.id}>{element.name}</option>
                                                })}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group as={Col} md="4" className="mb-2">
                                            <Form.Label className="m-0">Department</Form.Label>
                                            <Form.Select
                                                id="department"
                                                name="department"
                                                {...register("department")}
                                            >
                                                <option value={null}>Choose..</option>
                                                {departmentList.map((element, index) => {
                                                    return <option key={index} value={element.id}>{element.name}</option>
                                                })}
                                            </Form.Select>
                                        </Form.Group>
                                    </Row>
                                </Container>
                            </Tab>
                        </Tabs>
                    </Container>
                </Container>
            </Form>
        </Container>
    )
}
