export default function User() {
  const submitJob = () => {
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    jobs.push({ status: "Pending" });
    localStorage.setItem("jobs", JSON.stringify(jobs));
    alert("Print job submitted!");
  };

  return (
    <div className="page">
      <h1>Print Request</h1>

      <div className="form-grid">

        <div className="form-card">
          <h3>Upload Document</h3>
          <input type="file" />
        </div>

        <div className="form-card">
          <h3>Print Options</h3>

          <label>Color</label>
          <select>
            <option>Black & White</option>
            <option>Color</option>
          </select>

          <label>Copies</label>
          <input type="number" defaultValue="1" />

          <label>Binding</label>
          <select>
            <option>None</option>
            <option>Spiral</option>
            <option>Hard Bind</option>
          </select>
        </div>

        <div className="form-card">
          <button
            onClick={submitJob}
            style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Submit Print Request
          </button>
        </div>

      </div>
    </div>
  );
}

