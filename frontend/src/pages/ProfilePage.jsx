import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Table, Card, ListGroup } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'
import { getUserDetails, updateUserProfile } from "../actions/userAction";
import { listMyOrders } from "../actions/orderActions";
import { listUserAddresses, addUserAddress, deleteUserAddress, updateUserAddress } from "../actions/cartActions";
import { USER_ADDRESS_UPDATE_RESET } from "../constants/cartConstants";

function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Tab navigation state
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Address Form States
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [address, setAddress] = useState("");
  const [union, setUnion] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  const userDetails = useSelector((state) => state.userDetails);
  const { error, loading, user } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success: successUpdate } = userUpdateProfile || {};

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  const userAddressList = useSelector((state) => state.userAddressList);
  const { loading: loadingAddresses, error: errorAddresses, addresses } = userAddressList;

  const userAddressAdd = useSelector((state) => state.userAddressAdd);
  const { success: successAddAddress } = userAddressAdd || {};

  const userAddressDelete = useSelector((state) => state.userAddressDelete);
  const { success: successDeleteAddress } = userAddressDelete || {};

  const userAddressUpdate = useSelector((state) => state.userAddressUpdate);
  const { success: successUpdateAddress } = userAddressUpdate || {};

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      if (!user || !user.name || successUpdate) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
        dispatch(listMyOrders());
      } else {
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.email);            
      }
      
      // Load saved addresses
      dispatch(listUserAddresses());
      if (successUpdateAddress) {
        dispatch({ type: USER_ADDRESS_UPDATE_RESET });
      }
    }
  }, [dispatch, navigate, userInfo, user, successUpdate, successAddAddress, successDeleteAddress, successUpdateAddress]);

  useEffect(() => {
    if (successUpdate) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  }, [successUpdate]);

  const submitProfileHandler = (e) => {
    e.preventDefault();
    if (password !== confirm_password) {
      setProfileMessage("Passwords do not match");
    } else {
      dispatch(updateUserProfile({
        'id': user._id,
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'password': password
      }));
      setProfileMessage("");
    }
  };

  const submitAddressHandler = (e) => {
    e.preventDefault();
    if (editAddressId) {
      dispatch(updateUserAddress(editAddressId, {
        name,
        address,
        union,
        postOffice,
        postalCode,
        policeStation,
        district,
        division,
        country,
        phoneNumber,
        isDefault
      }));
    } else {
      dispatch(addUserAddress({
        name,
        address,
        union,
        postOffice,
        postalCode,
        policeStation,
        district,
        division,
        country,
        phoneNumber,
        isDefault
      }));
    }
    // Clear Form Fields
    setName("");
    setAddress("");
    setUnion("");
    setPostOffice("");
    setPostalCode("");
    setPoliceStation("");
    setDistrict("");
    setDivision("");
    setPhoneNumber("");
    setIsDefault(false);
    setEditAddressId(null);
    setShowAddAddress(false);
  };

  const deleteAddressHandler = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      dispatch(deleteUserAddress(id));
    }
  };

  return (
    <Row className="g-4 py-4">
      {/* Side Profile Card & Tab Selectors */}
      <Col md={3}>
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white text-center p-4">
          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '80px', height: '80px' }}>
            <i className="fas fa-user-circle text-secondary" style={{ fontSize: '4.5rem' }}></i>
          </div>
          <h4 className="fw-bold m-0 text-dark">{userInfo ? userInfo.name : "User Profile"}</h4>
          <span className="small text-muted mb-3 d-block">{userInfo ? userInfo.email : ""}</span>
          <span className={`badge mx-auto rounded-pill px-3 py-1.5 ${userInfo && userInfo.is_staff ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`} style={{ width: 'fit-content', fontSize: '0.75rem' }}>
            {userInfo && userInfo.is_staff ? 'Administrator' : 'Customer'}
          </span>
        </Card>

        {/* Tab selection links */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white p-2">
          <ListGroup variant="flush">
            <ListGroup.Item
              action
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              className={`border-0 rounded-3 py-2.5 px-3 mb-1 cursor-pointer small fw-semibold ${activeTab === "profile" ? 'bg-primary text-white' : 'text-secondary bg-transparent hover-bg-light'}`}
              style={{ cursor: 'pointer' }}
            >
              <i className="fas fa-user-cog me-2"></i>Profile Details
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              className={`border-0 rounded-3 py-2.5 px-3 mb-1 cursor-pointer small fw-semibold ${activeTab === "orders" ? 'bg-primary text-white' : 'text-secondary bg-transparent hover-bg-light'}`}
              style={{ cursor: 'pointer' }}
            >
              <i className="fas fa-shopping-bag me-2"></i>My Orders
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === "addresses"}
              onClick={() => setActiveTab("addresses")}
              className={`border-0 rounded-3 py-2.5 px-3 cursor-pointer small fw-semibold ${activeTab === "addresses" ? 'bg-primary text-white' : 'text-secondary bg-transparent hover-bg-light'}`}
              style={{ cursor: 'pointer' }}
            >
              <i className="fas fa-map-marker-alt me-2"></i>Address Book
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>

      {/* Dynamic Pane Switch */}
      <Col md={9}>
        {activeTab === "profile" && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h3 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.25rem' }}>Profile Information</h3>
            {profileMessage && <Message variant="danger">{profileMessage}</Message>}
            {profileSuccess && <Message variant="success">Profile updated successfully!</Message>}
            {error && <Message variant="danger">{typeof error === 'string' ? error : JSON.stringify(error)}</Message>}
            {loading && <Loader />}
            
            <Form onSubmit={submitProfileHandler}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="first_name" className="mb-3">
                    <Form.Label className="fw-semibold small text-muted">First Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Enter first name"
                      value={first_name || ''}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="shadow-none rounded-3 py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="last_name" className="mb-3">
                    <Form.Label className="fw-semibold small text-muted">Last Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Enter last name"
                      value={last_name || ''}
                      onChange={(e) => setLastName(e.target.value)}
                      className="shadow-none rounded-3 py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label className="fw-semibold small text-muted">Email Address</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow-none rounded-3 py-2"
                />
              </Form.Group>

              <Row className="mt-4 pt-2 border-top">
                <Col md={6}>
                  <Form.Group controlId="password" className="mb-3">
                    <Form.Label className="fw-semibold small text-muted">New Password (Optional)</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password || ''}
                      onChange={(e) => setPassword(e.target.value)}
                      className="shadow-none rounded-3 py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="confirm_password" className="mb-3">
                    <Form.Label className="fw-semibold small text-muted">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirm_password || ''}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="shadow-none rounded-3 py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button className="py-2.5 px-4 rounded-pill shadow-sm mt-3 btn-primary" type="submit" variant="primary">
                Update Details
              </Button>
            </Form>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h3 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.25rem' }}>My Purchase Orders</h3>
            {loadingOrders ? (
              <Loader />
            ) : errorOrders ? (
              <Message variant="danger">{errorOrders}</Message>
            ) : !orders || orders.length === 0 ? (
              <Message variant="info">You have not placed any orders yet.</Message>
            ) : (
              <Table striped hover responsive className="align-middle table-borderless">
                <thead className="table-light">
                  <tr style={{ fontSize: '0.85rem' }}>
                    <th className="py-3">ORDER ID</th>
                    <th className="py-3">PLACED DATE</th>
                    <th className="py-3">TOTAL</th>
                    <th className="py-3">PAYMENT</th>
                    <th className="py-3">DELIVERY</th>
                    <th className="py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} style={{ fontSize: '0.875rem' }}>
                      <td className="fw-bold text-dark py-3">#{order._id}</td>
                      <td>{order.createdAt ? order.createdAt.substring(0, 10) : ''}</td>
                      <td className="fw-bold text-primary">${order.totalPrice}</td>
                      <td>
                        {order.isPaid ? (
                          <span className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            <i className="fas fa-check-circle me-1"></i>Paid
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger px-2.5 py-1.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            <i className="fas fa-times me-1"></i>Unpaid
                          </span>
                        )}
                      </td>
                      <td>
                        {order.isDelivered ? (
                          <span className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            <i className="fas fa-truck me-1"></i>Delivered
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning px-2.5 py-1.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            <i className="fas fa-clock me-1"></i>Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <LinkContainer to={`/order/${order._id}`}>
                          <Button className="btn-sm rounded-pill px-3 py-1.5 shadow-none border-secondary" variant="outline-secondary" style={{ fontSize: '0.75rem' }}>
                            View Details
                          </Button>
                        </LinkContainer>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        )}

        {activeTab === "addresses" && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold m-0 text-dark" style={{ fontSize: '1.25rem' }}>My Shipping Address Book</h3>
              {!showAddAddress && (
                <Button 
                  onClick={() => setShowAddAddress(true)}
                  variant="outline-primary"
                  className="rounded-pill py-1 px-3 small border-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="fas fa-plus me-1"></i>Add Address
                </Button>
              )}
            </div>

            {loadingAddresses && <Loader />}
            {errorAddresses && <Message variant="danger">{errorAddresses}</Message>}

            {showAddAddress && (
              <Card className="border p-3 mb-4 rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0 text-secondary" style={{ fontSize: '0.95rem' }}>{editAddressId ? "Edit Address Profile" : "Add New Address Profile"}</h4>
                  <Button variant="link" className="text-decoration-none text-muted small p-0" onClick={() => {
                    setShowAddAddress(false);
                    setEditAddressId(null);
                    setName("");
                    setAddress("");
                    setUnion("");
                    setPostOffice("");
                    setPostalCode("");
                    setPoliceStation("");
                    setDistrict("");
                    setDivision("");
                    setPhoneNumber("");
                    setIsDefault(false);
                  }}>
                    Cancel
                  </Button>
                </div>
                
                <Form onSubmit={submitAddressHandler}>
                  <Form.Group controlId="new-name" className="mb-2">
                    <Form.Label className="small fw-semibold text-muted mb-1">Recipient Name (Mandatory)</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      size="sm"
                      className="shadow-none rounded"
                    />
                  </Form.Group>

                  <Form.Group controlId="new-address" className="mb-2">
                    <Form.Label className="small fw-semibold text-muted mb-1">Street Address</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="e.g. 123 Main Road, Banani"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      size="sm"
                      className="shadow-none rounded"
                    />
                  </Form.Group>

                  <Row className="g-2">
                    <Col xs={6} md={3}>
                      <Form.Group controlId="new-union" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">Union / Area</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Union"
                          value={union}
                          onChange={(e) => setUnion(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Group controlId="new-post" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">Post Office</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Post Office"
                          value={postOffice}
                          onChange={(e) => setPostOffice(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Group controlId="new-postal" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">Postal Code</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          placeholder="Postal Code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Group controlId="new-police" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">Police Station</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Thana"
                          value={policeStation}
                          onChange={(e) => setPoliceStation(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-2">
                    <Col xs={6} md={4}>
                      <Form.Group controlId="new-district" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">District</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          placeholder="District"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={4}>
                      <Form.Group controlId="new-division" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">Division</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          placeholder="Division"
                          value={division}
                          onChange={(e) => setDivision(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group controlId="new-country" className="mb-2">
                        <Form.Label className="small fw-semibold text-muted mb-1">Country</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          placeholder="Country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          size="sm"
                          className="shadow-none rounded"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId="new-phone" className="mb-2">
                    <Form.Label className="small fw-semibold text-muted mb-1">Phone Number (Mandatory)</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="e.g. 01712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      size="sm"
                      className="shadow-none rounded"
                    />
                  </Form.Group>

                  <Form.Group controlId="new-isdefault" className="mb-3 mt-2">
                    <Form.Check
                      type="checkbox"
                      label="Set as default delivery address"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="small text-secondary"
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" size="sm" className="rounded-pill px-4">
                    {editAddressId ? "Update Address" : "Save Address"}
                  </Button>
                </Form>
              </Card>
            )}

            {!addresses || addresses.length === 0 ? (
              <Message variant="info">No addresses saved to profile yet.</Message>
            ) : (
              <Row className="g-3">
                {addresses.map((addr) => (
                  <Col key={addr._id} md={6}>
                    <Card className="border rounded-3 p-3 position-relative h-100 bg-white shadow-none hover-shadow">
                      {addr.isDefault && (
                        <span className="position-absolute top-0 end-0 m-3 badge bg-primary rounded-pill px-2 py-1 small" style={{ fontSize: '0.65rem' }}>
                          Default
                        </span>
                      )}
                      
                      <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-home me-2 text-muted"></i>{addr.name ? `${addr.name} — ` : ''}Address Profile
                      </div>
                      
                      <p className="small text-muted mb-3 lh-relaxed" style={{ fontSize: '0.8rem' }}>
                        {addr.address}, {addr.union && `${addr.union}, `}
                        {addr.postOffice && `${addr.postOffice}, `}
                        {addr.policeStation && `${addr.policeStation}, `}
                        {addr.district && `${addr.district}, `}
                        {addr.division && `${addr.division}, `}
                        {addr.postalCode && `${addr.postalCode}, `}
                        {addr.country}
                      </p>
                      {addr.phoneNumber && (
                        <div className="small text-dark fw-semibold mb-3">
                          <i className="fas fa-phone-alt me-2 text-muted" style={{ fontSize: '0.75rem' }}></i>{addr.phoneNumber}
                        </div>
                      )}

                      <div className="mt-auto border-top pt-2 d-flex justify-content-between align-items-center">
                        <span className="small text-secondary fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Zip: {addr.postalCode}
                        </span>
                        <div className="d-flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditAddressId(addr._id);
                              setName(addr.name || "");
                              setAddress(addr.address || "");
                              setUnion(addr.union || "");
                              setPostOffice(addr.postOffice || "");
                              setPostalCode(addr.postalCode || "");
                              setPoliceStation(addr.policeStation || "");
                              setDistrict(addr.district || "");
                              setDivision(addr.division || "");
                              setCountry(addr.country || "Bangladesh");
                              setPhoneNumber(addr.phoneNumber || "");
                              setIsDefault(addr.isDefault || false);
                              setShowAddAddress(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            variant="link"
                            className="text-decoration-none text-primary small p-0 fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <i className="fas fa-edit me-1"></i>Edit
                          </Button>
                          <Button 
                            onClick={() => deleteAddressHandler(addr._id)}
                            variant="link"
                            className="text-decoration-none text-danger small p-0 fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <i className="fas fa-trash me-1"></i>Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        )}
      </Col>
    </Row>
  );
}

export default ProfilePage;
