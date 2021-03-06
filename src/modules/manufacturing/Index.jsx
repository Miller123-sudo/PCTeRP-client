import { React, useContext } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import WorkCenterList from './workCenter/WorkCenterList';
import WorkCenter from './workCenter/WorkCenter';
import BOMList from './bom/BOMList';
import BOM from './bom/BOM';
import JobOrderList from './jobOrder/JobOrderList';
import JobOrder from './jobOrder/JobOrder';
import ProductList from './product/ProductList';
import Product from './product/Product';
import JobComplition from './jobComplition/JobComplition';
import ComponentIssue from './componentIssue/ComponentIssue';
import CompleteJobOrder from './completeJobOrder/CompleteJobOrder';


export default function ManufacturingRoutes() {
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
    let { path, url } = useRouteMatch();


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}`}>Manufacturing</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/joborders`}>Job Orders</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/manufacturings/products`}>Products</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/manufacturings/boms`}>Bills of Materials</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Settings" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/manufacturings/workcenters`}>Work Centers</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>

                            <Nav>
                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <NavDropdown title={user.name} id="nav-dropdown">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link active><BsWifi /></Nav.Link>
                                {/* <Nav.Link><BsWifiOff /></Nav.Link> */}
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

                /*Default*/
                <Route exact path={`${path}`}>
                    <JobOrderList />
                </Route>

                /*Work Center Routes*/
                <Route path={`${path}/workcenters`}>
                    <WorkCenterList />
                </Route>
                <Route exact path={`${path}/workcenter`}>
                    <WorkCenter />
                </Route>
                <Route exact path={`${path}/workcenter/:id`}>
                    <WorkCenter />
                </Route>

                /*Bill of Material Routes*/
                <Route path={`${path}/boms`}>
                    <BOMList />
                </Route>
                <Route exact path={`${path}/bom`}>
                    <BOM />
                </Route>
                <Route exact path={`${path}/bom/:id`}>
                    <BOM />
                </Route>

                /*Job Orders Routes*/
                <Route path={`${path}/joborders`}>
                    <JobOrderList />
                </Route>
                <Route exact path={`${path}/joborder`}>
                    <JobOrder />
                </Route>
                <Route exact path={`${path}/joborder/:id`}>
                    <JobOrder />
                </Route>

                /*Job Complition Routes*/
                {/* <Route path={`${path}/joborders`}>
                    <JobOrderList />
                </Route> */}
                {/* <Route exact path={`${path}/joborder`}>
                    <JobOrder />
                </Route> */}
                <Route exact path={`${path}/jobComplition/:id`}>
                    <JobComplition />
                </Route>


                /*Component Issue Routes*/
                {/* <Route path={`${path}/joborders`}>
                    <JobOrderList />
                </Route> */}
                {/* <Route exact path={`${path}/joborder`}>
                    <JobOrder />
                </Route> */}
                <Route exact path={`${path}/componentIssue/:id`}>
                    <ComponentIssue />
                </Route>

                /*Complete Job Order Routes*/
                {/* <Route path={`${path}/joborders`}>
                    <JobOrderList />
                </Route> */}
                {/* <Route exact path={`${path}/joborder`}>
                    <JobOrder />
                </Route> */}
                <Route exact path={`${path}/completeJobOrder/:id`}>
                    <CompleteJobOrder />
                </Route>



                /*Product Routes*/
                <Route path={`${path}/products`}>
                    <ProductList />
                </Route>
                <Route exact path={`${path}/product`}>
                    <Product />
                </Route>
                <Route exact path={`${path}/product/:id`}>
                    <Product />
                </Route>

            </Switch>


        </Container >
    )
}


