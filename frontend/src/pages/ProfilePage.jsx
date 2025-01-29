import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'
import { getUserDetails,updateUserProfile } from "../actions/userAction";

function ProfilePage() {
     const location = useLocation();
      const navigate = useNavigate();
      const redirect = location.search ? location.search.split("=")[1] : "/";
      const [first_name, setFirstName] = useState("");
      const [last_name, setLastName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [confirm_password, setConfirmPassword] = useState("");
      const [message, setMessage] = useState("");
    
      const dispatch = useDispatch();
      const userDetails = useSelector((state) => state.userDetails);
      const { error, loading, user } = userDetails;
      console.log(userDetails)

      const userLogin = useSelector((state) => state.userLogin);
      const { userInfo } = userLogin;

      const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
      const { success } = userUpdateProfile || {};

      useEffect(() => {
        if (!userInfo) {
          navigate("/login");
        }else{
            if(!user || !user.name || success){
                dispatch({
                  type: USER_UPDATE_PROFILE_RESET
                })
                dispatch(getUserDetails('profile'))
            }else{
                setFirstName(user.first_name)
                setLastName(user.last_name)
                setEmail(user.email)            
            }
        }
      }, [dispatch, navigate, userInfo, user, success]);
    
      const submitHandler = (e) => {
        e.preventDefault();
        if(password !== confirm_password){
            setMessage("Passwords do not match");
        }else{
            console.log("updated")
            dispatch(updateUserProfile({
              'id':user._id,
              'first_name':first_name,
              'last_name':last_name,
              'email':email,
              'password':password
            }))
            setMessage("");
        }
      };

  return (
    <Row>
      <Col md={3}>
        <h2> Profile </h2>
        {message && <Message variant="danger">{message}</Message>}
      {error && <Message variant="danger">{typeof error === 'string' ? error : JSON.stringify(error)}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="first_name">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            required
            type="name"
            placeholder="Enter first name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="last_name">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            required
            type="name"
            placeholder="Enter last name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label> Email Address</Form.Label>
          <Form.Control
            required
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label> Password</Form.Label>
          <Form.Control
          
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="confirm_password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
          
            type="password"
            placeholder="Enter confirm password"
            value={confirm_password}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button className="my-2" type="submit" variant="primary">
          Update
        </Button>
      </Form>
      </Col>
      <Col md={9}>
        <h2> My Orders</h2>
      </Col>
    </Row>
  )
}

export default ProfilePage
