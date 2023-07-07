import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const DataAnalytics = () => {
  const [message, setMessage] = useState('');
  const [boms, setBOMs] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/BillofMats');
      const data = response.data;
      const BOMSdata = data.map((delivery) => ({
        id: delivery._id, // Assuming the ID field is "_id"
        name: delivery.name,
        location: delivery.location,
        subject: delivery.subject,
      }));
      setBOMs(BOMSdata);
    } catch (error) {
      console.error(error);
      setMessage('Error fetching data.');
    }
  };

  const handleBOMClick = (id) => {
    location.pathname = `/ProjectDetails/${id}`;
  };

  

  return (
    <div className="body1">
      
      <h1>Project List</h1>
      <p>{message}</p>

      <table className="top3">
        <thead>
          <tr>
            <th>Project Name</th>
          </tr>
        </thead>
        <tbody>
          {boms.map((bom) => (
            <tr key={bom.id} onClick={() => handleBOMClick(bom.id)}>
              <td>
                <Link to={`/ProjectDetails/${bom.id}`}>{bom.name}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataAnalytics;
