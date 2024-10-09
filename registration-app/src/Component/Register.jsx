import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/firebaseConfig';
import { db } from '../Firebase/firebaseConfig'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import '../Styles/Register.css';
import img1 from '../Images/SportsLogo.png';

const Register = () => {
  const [user, setUser] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    surname: '',
    age: 20,
    position: '',
    photo: null,
    idNumber: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setUser({ ...user, photo: e.target.files[0] });
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  // Register the user in Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user.password !== user.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid; // Get the user ID

      // Prepare user data to be stored in Firestore
      const userData = {
        userName: user.userName,
        surname: user.surname,
        email: user.email,
        age: user.age,
        idNumber: user.idNumber,
        role: user.position,
        photo: user.photo ? URL.createObjectURL(user.photo) : null // Handle photo if needed
      };

      // Check the selected position and save to the respective Firestore collection
      if (user.position === "System Admin") {
        await setDoc(doc(db, 'systems-admins', uid), userData);
      } else if (user.position === "Super Admin") {
        await setDoc(doc(db, 'super-admins', uid), userData);
      }

      alert('Registration successful');
      setUser({
        userName: '',
        password: '',
        confirmPassword: '',
        email: '',
        surname: '',
        age: 20,
        position: '',
        photo: null,
        idNumber: ''
      });
      navigate('/'); // Redirect to login page or homepage
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="wrapper">
      <div className="form-container">
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="logo-container">
              <img src={img1} alt="Logo" className="logo" />
            </div>
            <h1>Create<br />Account</h1>
            {error && <p className="error-message">{error}</p>}
            <div>
              <input 
                type="text" 
                name="userName" 
                placeholder="UserName" 
                value={user.userName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-box">
              <input 
                type="text" 
                name="surname" 
                placeholder="Surname" 
                value={user.surname} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-box">
              <input 
                type="password" 
                name="password" 
                placeholder="New Key" 
                value={user.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-box">
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirm Key" 
                value={user.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-box">
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={user.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-box">
              <input 
                type="text" 
                name="idNumber" 
                placeholder="ID Number" 
                value={user.idNumber} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-box">
              <select 
                name="age" 
                value={user.age} 
                onChange={handleChange} 
                required
              >
                {[...Array(81).keys()].slice(20).map(age => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-box">
              <select 
                name="position" 
                value={user.position} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Position</option>
                <option value="Super Admin">Super Admin</option>
                <option value="System Admin">System Admin</option>
              </select>
            </div>
            <div className="input-box">
              <input 
                type="file" 
                name="photo" 
                onChange={handleChange} 
                accept="image/*" 
              />
            </div>
            <div className="button-container">
              <button type="submit" className="sub-btn">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
