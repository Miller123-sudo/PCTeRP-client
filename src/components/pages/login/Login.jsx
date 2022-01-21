import { React, useContext, useState } from 'react';
import './login.css';
import { Container, Row, Col, Card, Alert, Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import { UserContext } from '../../states/contexts/UserContext';
import ApiService from '../../../helpers/ApiServices';
import { TokenService } from '../../../helpers/StorageServices';

export default function Login() {
    const [show, setShow] = useState(false);
    const { dispatch, isFetching } = useContext(UserContext)

    const onSubmit = async (e) => {
        e.preventDefault();
        const dataArr = [...new FormData(e.currentTarget)];
        const data = Object.fromEntries(dataArr);
        console.log(data)
        try {
            setShow(false)
            dispatch({ type: "LOGIN_START" });
            const response = await ApiService.post('employee/login', data);
            console.log(response)
            if (response.data.isSuccess) {
                TokenService.saveToken(response.data.token)
                ApiService.setHeader();
                dispatch({ type: "LOGIN_SUCCESS", payload: response.data.document });
            } else {
                setShow(true)
                dispatch({ type: "LOGIN_FAILURE" });
            }

        } catch (error) {
            setShow(true)
            dispatch({ type: "LOGIN_FAILURE" });

        }
    }
    return (
        <div className="loginPage">
            <Container className="loginForm">
                <Row className="justify-content-center">
                    <Col xxl={4} xs={12} sm={10} md={6} lg={5} xl={4}>
                        <Card className="shadow loginForm" style={{ width: '100%', padding: '1rem' }}>
                            <div className="companyLogo">
                                <Card.Img variant="top" style={{ width: '4rem', alignSelf: 'center', }} src="/static/img/company-icon.png" />
                                <h1 style={{ alignSelf: 'center', marginTop: '10px' }}>PCTeRP</h1>
                            </div>
                            <Form className="p-3 mt-4" onSubmit={onSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="Enter email" />
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" placeholder="Password" />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Remember me" />
                                </Form.Group>
                                <Alert show={show} variant="danger">
                                    Your email or password is incorrect! Please try again.
                                </Alert>
                                <Button style={{ width: '100%' }} variant="primary" type="submit">
                                    SIGN IN
                                </Button>
                                <div className="loginFormFooter">
                                    <span>Don't have an account?</span>
                                    <span><Link to="/forgotpassword" className="link">Reset password</Link></span>
                                </div>
                                <div className="loginFormFooter mt-4">
                                    <span>By clicking on the Log In button,
                                        you understand and agree to<Link to='/terms'> PCT Terms of Use </Link>
                                        and <Link to='/terms'> PCT Privacy Policy</Link></span>
                                </div>
                            </Form>


                        </Card>

                    </Col>
                </Row>
            </Container>


        </div>
    )
}
