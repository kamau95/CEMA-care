//handle login here
document.getElementById('login-form').addEventListener( 'submit', async(e)=>{
  e.preventDefault();

  try{
    const username= document.getElementById('username').value;
    const password= document.getElementById('password').value;

    const response= fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {"content-type": 'application/json'},
      body: JSON.stringify({username, password}), //convert to json string
    });

    const loginResult= await response.json();
    if(response.ok){
      window.location.href= 'search-client';//redirect user
    }else{
      // show error message
      alert(loginResult.message || 'login failed');
    }

  }catch(error){
    console.error('login error', error);
    alert("something went wrong try again later");
  }

})