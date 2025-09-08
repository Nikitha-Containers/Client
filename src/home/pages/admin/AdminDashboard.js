import { useState, useEffect } from "react";

function AdminDashboard() {
  const [getDetails, setDetails] = useState({});

  console.log("getDetails", getDetails);

  useEffect(() => {
    setDetails("Heyy");
  }, []);

  return <div>AdminDashboard</div>;
}

export default AdminDashboard;
