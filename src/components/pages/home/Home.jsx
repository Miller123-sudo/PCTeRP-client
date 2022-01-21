import { React, useContext } from 'react';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsBell, BsGearFill, BsWifi, BsWifiOff } from 'react-icons/bs'

import { UserContext } from '../../states/contexts/UserContext';
import { findInitLetters } from '../../../helpers/Utils';
import AppGallery from '../../ui/organisms/AppGallery';
import Dashboard from '../dashboard/Dashboard (1)';

export default function Home() {
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: '#009999' }} variant="dark">
                    <Container fluid>
                        <Navbar.Brand href="#home">PCTeRP</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto">

                            </Nav>
                            <Nav>
                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <NavDropdown title={user.name} id="nav-dropdown">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                                {
                                    navigator.onLine ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>
                                }
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>
            <Container className="pct-app-content-container p-0 m-0" fluid>
                <Container className="pct-app-content" fluid>
                    <Container className="pct-app-content-header  m-0 pb-2" fluid>


                    </Container>
                    <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                        <Container style={{ maxWidth: '760px' }}>
                            <AppGallery />
                            {/* <Dashboard /> */}
                        </Container>




                    </Container>

                </Container>
            </Container>

        </Container >
    )
}
