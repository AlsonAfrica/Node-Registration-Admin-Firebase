import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/firebaseConfig'; // Adjust based on your Firebase config
import { doc, getDoc } from 'firebase/firestore';
import img1 from '../Images/SportsLogo.png';
import '../Styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(''); // To store the role of the user
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser; // Get the logged-in user
      if (user) {
        try {
          const docRef = doc(db, 'super-admins', user.uid); // Assuming 'super-admins' is the collection for roles
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role); // Assuming the role is stored as 'role'
          }
        } catch (error) {
          console.error("Error fetching user role: ", error);
        }
      }
    };
    fetchUserRole();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/'); // Redirect to the home page after loading
    }, 2000); // Simulate a 2-second loading time
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="#"><img src={img1} alt="Logo" className="logo-nav" /></a>
      </div>
      <button className="hamburger" onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </button>
      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <li><Link to="/Home">Employees</Link></li>
        <li><Link to="/Admin">Admins</Link></li>
        <li><Link to="/Form">Add Employee</Link></li>

        {/* Conditionally render "Add Admin" based on role */}
        {role === 'superAdmin' && (
          <li><Link to="/RegisterAdmins">Add Admin</Link></li>
        )}

        <li><Link to="/Profile">Profile</Link></li>
        <li>
          <a href="#" onClick={handleLogout}>
            {isLoading ? 'Logging Out...' : 'Log Out'}
          </a>
        </li>
      </ul>
      {isLoading && <div className="loader">Logging out...</div>}
    </nav>
  );
};

export default Navbar;
