import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import FormContainer from "../components/FormContainer";
import CheckoutSteps from "../components/CheckoutSteps";
import Loader from "../components/Loader";
import Message from "../components/Message";

import { saveShippingAddress, listUserAddresses, addUserAddress, deleteUserAddress, updateUserAddress } from '../actions/cartActions'
import { USER_ADDRESS_ADD_RESET, USER_ADDRESS_UPDATE_RESET } from '../constants/cartConstants'

function ShippingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector(state => state.cart)
  const { shippingAddress } = cart

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  const userAddressList = useSelector(state => state.userAddressList)
  const { loading: loadingAddresses, error: errorAddresses, addresses } = userAddressList

  const userAddressAdd = useSelector(state => state.userAddressAdd)
  const { success: successAdd, address: newAddedAddress } = userAddressAdd

  const [address, setAddress] = useState('');
  const [union, setUnion] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('');
  const [division, setDivision] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  const userAddressUpdate = useSelector(state => state.userAddressUpdate)
  const { success: successUpdate, address: updatedAddress } = userAddressUpdate || {}

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping')
    } else {
      dispatch(listUserAddresses())
    }
  }, [dispatch, userInfo, navigate])

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      setSelectedAddressId(defaultAddr._id)
      setShowNewAddressForm(false)
    } else if (addresses && addresses.length === 0) {
      setShowNewAddressForm(true)
    }
  }, [addresses])

  useEffect(() => {
    if (successAdd && newAddedAddress) {
      dispatch(saveShippingAddress(newAddedAddress))
      dispatch({ type: USER_ADDRESS_ADD_RESET })
      navigate('/payment')
    }
  }, [successAdd, newAddedAddress, navigate, dispatch])

  useEffect(() => {
    if (successUpdate && updatedAddress) {
      dispatch(saveShippingAddress(updatedAddress))
      dispatch({ type: USER_ADDRESS_UPDATE_RESET })
      dispatch(listUserAddresses())
      setShowNewAddressForm(false)
      setEditAddressId(null)
      setName('')
      setAddress('')
      setUnion('')
      setPostOffice('')
      setPostalCode('')
      setPoliceStation('')
      setDistrict('')
      setDivision('')
      setPhoneNumber('')
      navigate('/payment')
    }
  }, [successUpdate, updatedAddress, navigate, dispatch])

  const deleteHandler = async (id, e) => {
    e.stopPropagation()
    await dispatch(deleteUserAddress(id))
    dispatch(listUserAddresses())
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (showNewAddressForm) {
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
          phoneNumber
        }))
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
          phoneNumber
        }))
      }
    } else {
      const selected = addresses.find(addr => addr._id === Number(selectedAddressId))
      if (selected) {
        dispatch(saveShippingAddress(selected))
        navigate('/payment')
      }
    }
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1 className="h2 fw-bold mb-4 text-center">Delivery Details</h1>
      
      {loadingAddresses && <Loader />}
      {errorAddresses && <Message variant="danger">{errorAddresses}</Message>}

      <Form onSubmit={submitHandler}>
        {addresses && addresses.length > 0 && (
          <div className="mb-4">
            <h3 className="h5 fw-bold mb-3 text-secondary">Select Shipping Address</h3>
            <Row className="g-3">
              {addresses.map((addr) => (
                <Col md={12} key={addr._id}>
                  <Card 
                    className={`border rounded-4 p-3 transition-all ${selectedAddressId === addr._id && !showNewAddressForm ? 'border-primary bg-light' : 'border-light'}`}
                    onClick={() => {
                      setSelectedAddressId(addr._id)
                      setShowNewAddressForm(false)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Check
                        type="radio"
                        id={`address-${addr._id}`}
                        name="address-picker"
                        checked={selectedAddressId === addr._id && !showNewAddressForm}
                        onChange={() => {
                          setSelectedAddressId(addr._id)
                          setShowNewAddressForm(false)
                        }}
                        label={
                          <div className="ms-2">
                            <div className="fw-semibold text-dark">
                              {addr.name ? `${addr.name} — ` : ''}{addr.address}
                              {addr.isDefault && <span className="badge bg-primary ms-2 px-2.5 py-1 small rounded-pill">Default</span>}
                            </div>
                            <div className="text-secondary small mt-1">
                              {addr.union}, {addr.policeStation}, {addr.district}, {addr.division} - {addr.postalCode}
                            </div>
                            {addr.phoneNumber && (
                              <div className="text-dark small mt-1 fw-semibold">
                                <i className="fas fa-phone-alt me-1.5 text-muted" style={{ fontSize: '0.75rem' }}></i>{addr.phoneNumber}
                              </div>
                            )}
                          </div>
                        }
                      />
                      <div className="d-flex align-items-center gap-2">
                        <Button 
                          variant="link" 
                          className="text-primary p-0 text-decoration-none small fw-semibold" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditAddressId(addr._id);
                            setName(addr.name || '');
                            setAddress(addr.address || '');
                            setUnion(addr.union || '');
                            setPostOffice(addr.postOffice || '');
                            setPostalCode(addr.postalCode || '');
                            setPoliceStation(addr.policeStation || '');
                            setDistrict(addr.district || '');
                            setDivision(addr.division || '');
                            setPhoneNumber(addr.phoneNumber || '');
                            setShowNewAddressForm(true);
                          }}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="fas fa-edit small me-1"></i>Edit
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-danger p-0" 
                          onClick={(e) => deleteHandler(addr._id, e)}
                        >
                          <i className="fas fa-trash-alt h6 mb-0"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline-primary" 
                className="rounded-pill px-4 shadow-none btn-sm"
                onClick={() => setShowNewAddressForm(true)}
              >
                + Add New Address
              </Button>
            </div>
          </div>
        )}

        {showNewAddressForm && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h3 className="h5 fw-bold mb-4">{editAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}</h3>
            
            <Form.Group controlId="name" className="mb-3">
              <Form.Label className="fw-semibold">Recipient Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter recipient full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow-none rounded-3"
              />
            </Form.Group>
            
            <Form.Group controlId="address" className="mb-3">
              <Form.Label className="fw-semibold">Street Address</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="shadow-none rounded-3"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="union" className="mb-3">
                  <Form.Label className="fw-semibold">City / Union</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter city or union"
                    value={union}
                    onChange={(e) => setUnion(e.target.value)}
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="postOffice" className="mb-3">
                  <Form.Label className="fw-semibold">Post Office</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter post office"
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="postalCode" className="mb-3">
                  <Form.Label className="fw-semibold">Postal Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="policeStation" className="mb-3">
                  <Form.Label className="fw-semibold">Police Station / Thana</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter police station"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="district" className="mb-3">
                  <Form.Label className="fw-semibold">District</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="division" className="mb-3">
                  <Form.Label className="fw-semibold">Division</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter division"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="shadow-none rounded-3"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="phoneNumber" className="mb-3">
              <Form.Label className="fw-semibold">Phone Number (Mandatory)</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter active phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="shadow-none rounded-3"
              />
            </Form.Group>

            {addresses && addresses.length > 0 && (
              <div className="text-end mt-2">
                <Button 
                  variant="link" 
                  className="text-secondary p-0 text-decoration-none small"
                  onClick={() => {
                    setShowNewAddressForm(false);
                    setEditAddressId(null);
                    setName('');
                    setAddress('');
                    setUnion('');
                    setPostOffice('');
                    setPostalCode('');
                    setPoliceStation('');
                    setDistrict('');
                    setDivision('');
                    setPhoneNumber('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </Card>
        )}

        <Button 
          type="submit" 
          variant='primary' 
          className="w-100 py-3 rounded-3 shadow-sm mt-3"
          disabled={!showNewAddressForm && !selectedAddressId}
        >
          {editAddressId ? 'Update Address & Continue' : showNewAddressForm ? 'Save Address & Continue' : 'Deliver to Selected Address'}
        </Button>
      </Form>
    </FormContainer>
  )
}

export default ShippingPage
