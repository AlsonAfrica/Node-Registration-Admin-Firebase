import React, { useState } from 'react';
import '../Styles/EmployeeForm.css';

const ProfileForm = () => {
  const [name, setName] = useState('John Doe');
  const [id, setId] = useState('1234567890123');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('0123456789');
  const [position, setPosition] = useState('Manager');
  const [picture, setPicture] = useState('https://via.placeholder.com/150');
  const [isEditing, setIsEditing] = useState(false); // Control editing mode

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
          <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
          <button type="button" onClick={handleSave}>Save</button>
        </>
      )}

      {!isEditing && (
        <>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>ID:</strong> {id}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Position:</strong> {position}</p>
          <button type="button" onClick={handleEdit}>Edit</button>
        </>
      )}
    </form>
  );
};

export default ProfileForm;
