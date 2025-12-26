import { useState, useEffect } from "react";

function AdminDashboard() {
  const [getDetails, setDetails] = useState({});

  useEffect(() => {
    setDetails("Heyy");
  }, []);

  return <div>AdminDashboard</div>;
}

export default AdminDashboard;
