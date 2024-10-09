import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/firebaseConfig'; // Adjust this import according to your Firebase setup
import { doc, getDoc } from 'firebase/firestore';
import '../Styles/EmployeeForm.css';

const ProfileForm = () => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [surname, setSurname] = useState('');
  const [position, setPosition] = useState('');
  const [age, setAge] = useState('');
  const [picture, setPicture] = useState('https://via.placeholder.com/150');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; // Get the currently logged-in user
      if (user) {
        // Attempt to fetch from 'systems-admins' collection first
        const systemsAdminRef = doc(db, 'systems-admins', user.uid);
        const systemsAdminDoc = await getDoc(systemsAdminRef);

        if (systemsAdminDoc.exists()) {
          const data = systemsAdminDoc.data();
          setUserData(data); // Set the fetched data from systems-admins
        } else {
          // If no document found, attempt to fetch from 'super-admins' collection
          const superAdminRef = doc(db, 'super-admins', user.uid);
          const superAdminDoc = await getDoc(superAdminRef);

          if (superAdminDoc.exists()) {
            const data = superAdminDoc.data();
            setUserData(data); // Set the fetched data from super-admins
          } else {
            console.log('No document found in either collection!');
          }
        }
      }
    };

    fetchUserData();
  }, []);

  // Helper function to set state with fetched user data
  const setUserData = (data) => {
    setName(data.userName);
    setAge(data.age);
    setSurname(data.surname);
    setId(data.idNumber);
    setEmail(data.email);
    setPhone(data.phone);
    setPosition(data.role);
    setPicture(data.photo || picture); // Set the default placeholder if no picture is found
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicture(reader.result); // Set image as base64
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleSave = () => {
    setIsEditing(false); // Disable editing mode after saving
    // Here you would usually save the changes to the server or database
  };

  return (
    <form className="employee-form">
      <h2>PROFILE DETAILS</h2>

      <div className="profile-photo">
        <img src={picture} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
      </div>

      {isEditing && (
        <>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
          <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
          <input type="text" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} readOnly />
          <button type="button" onClick={handleSave}>Save</button>
        </>
      )}

      {!isEditing && (
        <>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Surname:</strong> {surname}</p>
          <p><strong>ID:</strong> {id}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Age:</strong> {age}</p>
          <p><strong>Position:</strong> {position}</p>
          <button type="button" onClick={handleEdit}>Edit</button>
        </>
      )}
    </form>
  );
};

export default ProfileForm;
