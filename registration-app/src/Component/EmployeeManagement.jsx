import React, { useState, useEffect } from 'react';
import { useEmployeeContext } from '../contexts/EmployeeContext';
import { db } from '../Firebase/firebaseConfig'; // Import your Firestore config
import { collection, getDocs } from 'firebase/firestore';
import '../Styles/EmployeeManagement.css';
import EditEmployeeForm from './EditEmployeeForm';

const EmployeeManagement = () => {
  const { employees, setEmployees, previousEmployees, setPreviousEmployees } = useEmployeeContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Load employees from Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesCollection = collection(db, 'users');
        const employeeSnapshot = await getDocs(employeesCollection);
        const employeeList = employeeSnapshot.docs.map(doc => ({
          id: doc.id,
          idNumber: doc.data().idNumber,
          ...doc.data()
        }));
        setEmployees(employeeList);
      } catch (error) {
        console.error("Error fetching employees from Firestore:", error);
      }
    };

    fetchEmployees();
  }, [setEmployees]);

  // Load previous employees from Firestore
  useEffect(() => {
    const fetchPreviousEmployees = async () => {
      try {
        const previousEmployeesCollection = collection(db, 'previousEmployees');
        const previousEmployeeSnapshot = await getDocs(previousEmployeesCollection);
        const previousEmployeeList = previousEmployeeSnapshot.docs.map(doc => ({
          id: doc.id,
          idNumber: doc.data().idNumber,
          ...doc.data()
        }));
        setPreviousEmployees(previousEmployeeList);
      } catch (error) {
        console.error("Error fetching previous employees from Firestore:", error);
      }
    };

    fetchPreviousEmployees();
  }, [setPreviousEmployees]);

  // Save previous employees to localStorage whenever `previousEmployees` changes
  useEffect(() => {
    if (previousEmployees.length > 0) {
      try {
        localStorage.setItem('previousEmployees', JSON.stringify(previousEmployees));
      } catch (error) {
        console.error('Error saving previous employees to localStorage:', error);
      }
    }
  }, [previousEmployees]);
 
  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete the employee');
      }
  
      const employeeToDelete = employees.find((employee) => employee.id === id);
      if (employeeToDelete) {
        const updatedEmployees = employees.filter((employee) => employee.id !== id);
        const updatedPreviousEmployees = [...previousEmployees, employeeToDelete];
  
        setEmployees(updatedEmployees);
        setPreviousEmployees(updatedPreviousEmployees);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };
  

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
  };

  const handleSave = (updatedEmployee) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    );
    setEmployees(updatedEmployees);
    setEditingEmployee(null);
  };

  const handleCancel = () => {
    setEditingEmployee(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="employee-management">
      <h1>Employee Management</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by ID Number"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      {editingEmployee ? (
        <EditEmployeeForm
          employeeToEdit={editingEmployee}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="tables-container">
          <div className="table-container">
            <h2>Current Employees</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID Number</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Position</th>
                  <th>Picture</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.idNumber}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.position}</td>
                    <td>
                      <img src={employee.image} alt={employee.name} />
                    </td>
                    <td className="actions">
                      <button className="edit-btn" onClick={() => handleEdit(employee)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(employee.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <h2>Previous Employees</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID Number</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Position</th>
                  <th>Picture</th>
                </tr>
              </thead>
              <tbody>
                {previousEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.idNumber}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phoneNumber}</td> {/* Ensure this matches the field name */}
                    <td>{employee.position}</td>
                    <td>
                      <img src={employee.image} alt={employee.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

