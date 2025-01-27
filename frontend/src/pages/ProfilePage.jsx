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
      const userLogin = useSelector((state) => state.userLogin);
      const { userInfo } = userLogin;

      const userUpdateProfile = useSelector((state) => state.updateUserProfile);
      const { success } = userUpdateProfile;

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
      </Col>
      <Col md={9}>
        <h2> My Orders</h2>
      </Col>
    </Row>
  )
}

export default ProfilePage
