export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Customer Microservice</h1>
      <p>API Endpoints:</p>
      <ul>
        <li>
          <strong>POST</strong> /api/customers - Create a new customer
        </li>
        <li>
          <strong>GET</strong> /api/customers/[id] - Get customer by Unique ID
        </li>
        <li>
          <strong>PUT</strong> /api/customers/[id] - Update customer by Unique
          ID
        </li>
        <li>
          <strong>DELETE</strong> /api/customers/[id] - Delete customer by
          Unique ID
        </li>
        <li>
          <strong>GET</strong> /api/customers/email/[email] - Get customer by
          Email
        </li>
        <li>
          <strong>GET</strong> /api/customers/phone/[phoneNo] - Get customer by
          Phone Number
        </li>
        <li>
          <strong>GET</strong> /api/metrics - View request metrics
        </li>
      </ul>
    </main>
  );
}
