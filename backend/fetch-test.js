const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ3b3JraHViLmNvbSIsImVudiI6InByb2QiLCJleHAiOjE3Nzc0NzA1NzksImlhdCI6MTc3NzQzNDU3OSwiaXNzIjoid29ya2h1Yi5jb20iLCJqdGkiOiI4NjZlMWEwOC0xNzg0LTQyNjAtYTRiYi02ZmIxMTE4ODk2NjIiLCJsbSI6IlBBU1NXT1JEIiwibG9naW5fdXNlcl9pZCI6IjdIVjRESU9SNEpSUFY0QVlFQ1VVTlNSNlI0MzdaSlhNIiwibmJmIjoxNzc3NDM0NTc4LCJzY29wZSI6WyJ1OnYiLCJ3OnYiXSwic2lkIjoiUlFBT1dSQUNKQUhQRUNEVURJUTZRNFlFT0NYQ0hBQlBHM1M0RkZWWSIsInN1YiI6IjdIVjRESU9SNEpSUFY0QVlFQ1VVTlNSNlI0MzdaSlhNIiwidG50IjoiSUo3SjZDV00yWFVKS1ZMS0w3SEhPT0NMUEZNT1dGV1ciLCJ0eXAiOiJyZWZyZXNoIiwidW5hbWUiOiJ0aCB0c3QifQ.xBYJHPfOc6OE2_tzNGer9Tm8RnCF9Z15gWGUKm2wxwsOP1PCIDz3snuf9uxmIErQ2hvWE651lgRlbxNtWF_-Bg';
const url = 'https://app.workhub24.com/api/workflows/IJ7J6CWM2XUJKVLKL7HHOOCLPFMOWFWW/wb4c791a6a7/cards';

const payloads = {
  withoutTables: {
    title:'TEST', 
    fullName:'Token test', 
    nicNo:'123',
    email: 'test@example.com',
    mobile1: '0771234567'
  },
  withTables: {
    title:'TEST', 
    fullName:'Token test', 
    nicNo:'123',
    email: 'test@example.com',
    mobile1: '0771234567',
    bankDetails:[{bank:'BOC',branch:'Colombo',accountNo:'001234567',bankTel:'0112345678',officer:'Mr Silva'}],
    creditFacilities:[{creditInstitution:'Peoples Bank',creditType:'Personal Loan',creditApprovedAmount:'10000',creditTerm:'12',creditMonthlyRepayment:'1000',creditPresentOS:'5000'}],
    vehicle:[{vehicleMakeModel:'Toyota',vehicleValue:'2000000',vehicleRegNo:'CAR001',vehicleOwnership:'Own'}]
  }
};

(async()=>{
  for (const [name, body] of Object.entries(payloads)) {
    try {
      const res = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/json',Accept:'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify(body)
      });
      const text = await res.text();
      console.log('---', name, res.status);
      console.log(text);
    } catch (err) {
      console.error('ERROR', name, err);
    }
  }
})();
