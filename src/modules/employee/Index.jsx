import { React, useContext } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { findInitLetters } from '../../helpers/Utils';
import EmployeeList from './employee/EmployeeList';
import Employee from './employee/Employee';
import { UserContext } from '../../components/states/contexts/UserContext';
import DepartmentList from './department/DepartmentList';
import Department from './department/Department';
import JobPosition from './jobPosition/JobPosition';
import JobPositionList from './jobPosition/JobPositionList';
import WorkLocation from './workLocation/WorkLocation';
import WorkLocationList from './workLocation/WorkLocationList';


function EmployeeRoutes() {
    let { path, url } = useRouteMatch();
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }

    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}`}>Employee</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Employees" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}`}>Employees</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Departments" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/employees/departments`}>Departments</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Settings" id="basic-nav-dropdown">

                                    <NavDropdown.Item as={Link} to={`/employees/jobpositions`}>Job Position</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/employees/departments`}>Departments</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/employees/worklocations`}>Work Locations</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <NavDropdown title={user.name} id="nav-dropdown">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link as={Link} to="/notification"><BsBell /></Nav.Link>
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>
                {/* <Route exact path={path}>
                <Container className="pct-app-content-container p-0 m-0" fluid>
                    <Container className="pct-app-content" fluid>
                        <Container className="pct-app-content-header p-0 m-0" fluid>
                            <h1>Content Header</h1>
                        </Container>
                        <Container className="pct-app-content-body p-0 m-0" fluid>
                            <Button as={Link} to={`${path}/testing`}>Testing</Button>
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                            <h1>Content Body</h1><br />
                        </Container>
                    </Container>

                </Container>
            </Route> */}

                <Route exact path={`${path}`}>
                    <EmployeeList />

                </Route>

                /*Employee Routes*/
                <Route path={`${path}/employees`}>
                    <EmployeeList />
                </Route>
                <Route exact path={`${path}/employee`}>
                    <Employee />
                </Route>
                <Route exact path={`${path}/employee/:id`}>
                    <Employee />
                </Route>


                /*Departments Routes*/
                <Route path={`${path}/departments`}>
                    <DepartmentList />
                </Route>
                <Route exact path={`${path}/department`}>
                    <Department />
                </Route>
                <Route exact path={`${path}/department/:id`}>
                    <Department />
                </Route>

                /*Departments Routes*/
                <Route path={`${path}/jobpositions`}>
                    <JobPositionList />
                </Route>
                <Route exact path={`${path}/jobposition`}>
                    <JobPosition />
                </Route>
                <Route exact path={`${path}/jobposition/:id`}>
                    <JobPosition />
                </Route>

                /*Work Location Routes*/
                <Route path={`${path}/worklocations`}>
                    <WorkLocationList />
                </Route>
                <Route exact path={`${path}/worklocation`}>
                    <WorkLocation />
                </Route>
                <Route exact path={`${path}/worklocation/:id`}>
                    <WorkLocation />
                </Route>

                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>






            </Switch>


        </Container >
    )
}

export { EmployeeRoutes }
