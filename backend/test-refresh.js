// Test token refresh via API endpoint
(async () => {
  try {
    console.log("🧪 Testing token refresh endpoint...\n");
    const response = await fetch("http://localhost:3003/api/debug/token-info", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    const data = await response.json();
    console.log("✅ Token Info Response:");
    console.log(JSON.stringify(data, null, 2));
    
    console.log("\n🧪 Testing refresh endpoint...\n");
    const refreshResponse = await fetch("http://localhost:3003/api/debug/refresh-token", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    const refreshData = await refreshResponse.json();
    console.log("✅ Refresh Response:");
    console.log(JSON.stringify(refreshData, null, 2));
    
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
})();
